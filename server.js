const express = require("express");
const midtransClient = require("midtrans-client");
const { db } = require("./firebase");
const { collection, getDocs, query, where, updateDoc, doc } = require("firebase/firestore");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Route utama
app.get("/", (req, res) => {
    res.send("Hello! API Midtrans is running.");
});

// Endpoint callback dari Midtrans
app.post("/api/midtrans", async (req, res) => {
    try {
        const data = req.body;
        console.log("Callback received:", data);

        if (!data.order_id) {
            return res.status(400).json({ error: "order_id is required" });
        }

        let apiClient = new midtransClient.CoreApi({
            isProduction: false,
            serverKey: process.env.MIDTRANS_SERVER_KEY
        });

        // Cek status transaksi dari Midtrans
        const transactionStatus = await apiClient.transaction.status(data.order_id);
        console.log("🔍 Transaction Status:", transactionStatus);

        // Cari transaksi berdasarkan order_id di Firestore
        const transactionsRef = collection(db, "transactions");
        const q = query(transactionsRef, where("order_id", "==", data.order_id));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            console.log(`⚠ Order ID ${data.order_id} tidak ditemukan di Firestore.`);
            return res.status(404).json({ error: "Order ID not found in Firestore" });
        }

        // Loop menggunakan `for...of` agar `await` bisa bekerja dengan benar
        for (const docSnap of querySnapshot.docs) {
            const docRef = doc(db, "transactions", docSnap.id);

            try {
                if (transactionStatus.transaction_status === "settlement") {
                    await updateDoc(docRef, {
                        status: "success",
                        updated_at: new Date()
                    });
                    console.log(`✅ Order ${data.order_id} diperbarui menjadi SUCCESS.`);
                } else {
                    await updateDoc(docRef, {
                        status: transactionStatus.transaction_status,
                        updated_at: new Date()
                    });
                    console.log(`ℹ️ Order ${data.order_id} diperbarui menjadi ${transactionStatus.transaction_status}.`);
                }
            } catch (updateError) {
                console.error(`❌ Gagal memperbarui transaksi ${data.order_id}:`, updateError);
            }
        }

        return res.status(200).json({
            message: "Callback processed successfully",
            transaction_status: transactionStatus.transaction_status
        });

    } catch (error) {
        console.error("❌ Error processing callback:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

// Jalankan server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
