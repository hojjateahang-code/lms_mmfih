import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for parsing JSON bodies
  app.use(express.json());

  const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseServiceKey = process.env.VITE_SUPABASE_ANON_KEY || 'placeholder'; // For secure operations, should use service_role key ideally, but anon key works for test
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // --- ZARINPAL MOCK API FOR PREVIEW ---
  // If Merchant ID is not provided, we run in sandbox/mock mode
  
  app.post("/api/payment/request", async (req, res) => {
    try {
      const { amount, description, user_id } = req.body;
      const merchant_id = process.env.ZARINPAL_MERCHANT_ID;
      
      if (!amount || !user_id) {
        return res.status(400).json({ error: "Amount and user_id are required" });
      }

      // Generate a unique order ID
      const order_id = `ORDER_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

      const callback_url = `${process.env.APP_URL || "http://localhost:3000"}/payment/verify?user_id=${user_id}&amount=${amount}`;

      if (!merchant_id || merchant_id === "") {
        // MOCK MODE: No Merchant ID, simulate Zarinpal locally
        console.log("Mock Payment Request:", { amount, description, user_id, order_id });
        const mockAuthority = `MOCK_AUTH_${Date.now()}`;
        
        // Return a link that redirects back to our app's mock verifier page
        const redirectUrl = `${callback_url}&Authority=${mockAuthority}&Status=OK`;
        
        return res.json({
          url: redirectUrl,
          authority: mockAuthority
        });
      }

      // REAL MODE: Make actual request to Zarinpal (Sandbox or Real)
      const isSandbox = merchant_id.length < 36; // Usually 36 chars. If less, maybe sandbox.
      const baseUrl = isSandbox 
        ? "https://sandbox.zarinpal.com/pg/v4/payment/request.json" 
        : "https://api.zarinpal.com/pg/v4/payment/request.json";

      const response = await fetch(baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          merchant_id,
          amount,
          description: description || "افزایش موجودی کیف پول",
          callback_url
        })
      });

      const data = await response.json();

      if (data.data && data.data.code === 100) {
        const url = isSandbox 
          ? `https://sandbox.zarinpal.com/pg/StartPay/${data.data.authority}`
          : `https://www.zarinpal.com/pg/StartPay/${data.data.authority}`;
          
        return res.json({
          url,
          authority: data.data.authority
        });
      } else {
        console.error("Zarinpal error:", data);
        return res.status(400).json({ error: "Zarinpal request failed", details: data.errors });
      }
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/payment/verify", async (req, res) => {
    try {
      const { authority, amount, user_id, status } = req.body;
      const merchant_id = process.env.ZARINPAL_MERCHANT_ID;

      if (status !== 'OK') {
        return res.status(400).json({ success: false, message: 'تراکنش ناموفق بود یا توسط کاربر لغو شد' });
      }

      if (!merchant_id || merchant_id === "") {
        // MOCK MODE VERIFICATION
        console.log("Mock Payment Verify:", { authority, amount, user_id });
        
        // 1. Fetch current balance
        const { data: walletData, error: walletError } = await supabase
          .from('wallets')
          .select('balance')
          .eq('id', user_id)
          .single();
          
        if (walletError && walletError.code !== 'PGRST116') {
          return res.status(500).json({ success: false, message: 'خطا در دریافت کیف پول' });
        }

        const currentBalance = walletData?.balance || 0;
        const newBalance = currentBalance + Number(amount);

        // 2. Update wallet
        await supabase
          .from('wallets')
          .upsert({ id: user_id, balance: newBalance });

        // 3. Record transaction
        await supabase
          .from('transactions')
          .insert({
            user_id,
            amount: Number(amount),
            type: 'deposit',
            status: 'completed',
            reference_id: authority
          });

        return res.json({ success: true, ref_id: `MOCK_REF_${Date.now()}` });
      }

      // REAL MODE VERIFICATION
      const isSandbox = merchant_id.length < 36;
      const baseUrl = isSandbox 
        ? "https://sandbox.zarinpal.com/pg/v4/payment/verify.json" 
        : "https://api.zarinpal.com/pg/v4/payment/verify.json";

      const response = await fetch(baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          merchant_id,
          amount,
          authority
        })
      });

      const data = await response.json();

      if (data.data && (data.data.code === 100 || data.data.code === 101)) {
        // Payment successful
        
        // 1. Fetch current balance
        const { data: walletData } = await supabase
          .from('wallets')
          .select('balance')
          .eq('id', user_id)
          .single();
          
        const currentBalance = walletData?.balance || 0;
        const newBalance = currentBalance + Number(amount);

        // 2. Update wallet
        await supabase
          .from('wallets')
          .upsert({ id: user_id, balance: newBalance });

        // 3. Record transaction
        await supabase
          .from('transactions')
          .insert({
            user_id,
            amount: Number(amount),
            type: 'deposit',
            status: 'completed',
            reference_id: data.data.ref_id.toString()
          });

        return res.json({ success: true, ref_id: data.data.ref_id });
      } else {
        console.error("Zarinpal verify error:", data);
        return res.status(400).json({ success: false, message: 'تایید تراکنش با خطا مواجه شد' });
      }
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });


  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
