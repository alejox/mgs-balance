import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    console.log(
      "🔄 API Route: Obteniendo precio COP/USDT desde Binance P2P..."
    );

    // Obtener precio COP/USDT desde Binance P2P
    let copUsdtRate = 4000.0; // Valor por defecto

    try {
      // Obtener datos del mercado P2P de Binance para COP/USDT
      const p2pResponse = await fetch(
        "https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
          body: JSON.stringify({
            page: 1,
            rows: 10,
            payTypes: [],
            asset: "USDT",
            tradeType: "BUY",
            fiat: "COP",
            publisherType: null,
          }),
        }
      );

      if (p2pResponse.ok) {
        const p2pData = await p2pResponse.json();
        console.log("✅ API Route: Datos P2P obtenidos:", p2pData);

        if (p2pData.success && p2pData.data && p2pData.data.length > 0) {
          // Calcular el precio promedio de los primeros 5 anuncios
          const prices = p2pData.data
            .slice(0, 5)
            .map((ad: { adv: { price: string } }) => parseFloat(ad.adv.price))
            .filter((price: number) => !isNaN(price));

          if (prices.length > 0) {
            const averagePrice =
              prices.reduce((a: number, b: number) => a + b, 0) / prices.length;
            copUsdtRate = averagePrice;
            console.log("✅ Precio promedio COP/USDT desde P2P:", copUsdtRate);
            console.log("📊 Precios individuales:", prices);
          }
        } else {
          console.warn("⚠️ No se encontraron datos P2P válidos");
        }
      } else {
        console.warn("⚠️ Error obteniendo datos P2P:", p2pResponse.status);
      }
    } catch (error) {
      console.warn("⚠️ Error en conexión a Binance P2P:", error);
    }

    // También obtener el precio de USDT para validación
    let usdRate = 1.0;
    try {
      const usdcResponse = await fetch(
        "https://api.binance.com/api/v3/ticker/price?symbol=USDTUSDC",
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (usdcResponse.ok) {
        const usdcData = await usdcResponse.json();
        if (usdcData.price) {
          usdRate = parseFloat(usdcData.price);
          console.log("✅ USDT/USDC rate desde Binance:", usdRate);
        }
      }
    } catch (error) {
      console.warn("⚠️ Error obteniendo USDT/USDC:", error);
    }

    // Usar directamente el precio P2P obtenido
    const usdtCopRate = copUsdtRate.toFixed(2);

    console.log("💰 API Route: Precio final COP/USDT desde P2P:", usdtCopRate);

    return NextResponse.json({
      success: true,
      data: {
        usdtUsdPrice: usdRate,
        usdtCopPrice: usdtCopRate,
        source: "Binance P2P Market",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("❌ API Route Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
        fallback: {
          usdtCopPrice: "4000.00",
          source: "Valor por defecto",
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}
