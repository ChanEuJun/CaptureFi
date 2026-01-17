import { useEffect, useRef } from 'react';

interface TradingViewWidgetProps {
    symbol: string;
}

declare global {
    interface Window {
        TradingView: any;
    }
}

export function TradingViewWidget({ symbol }: TradingViewWidgetProps) {
    const container = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://s3.tradingview.com/tv.js";
        script.type = "text/javascript";
        script.async = true;
        script.onload = () => {
            if (container.current && window.TradingView) {
                new window.TradingView.widget({
                    "width": "100%",
                    "height": 300,
                    "symbol": symbol.includes("/") ? `BINANCE:${symbol.replace("/", "")}` : symbol,
                    "interval": "D",
                    "timezone": "Etc/UTC",
                    "theme": "dark",
                    "style": "1",
                    "locale": "en",
                    "toolbar_bg": "#f1f3f6",
                    "enable_publishing": false,
                    "allow_symbol_change": true,
                    "container_id": container.current.id
                });
            }
        };
        document.head.appendChild(script);

        return () => {
            // Cleanup script if needed, though usually fine to keep it
        };
    }, [symbol]);

    return (
        <div className='tradingview-widget-container' style={{ height: "300px", width: "100%" }}>
            <div id={`tradingview_${symbol.replace("/", "_")}`} ref={container} style={{ height: "300px", width: "100%" }} />
        </div>
    );
}
