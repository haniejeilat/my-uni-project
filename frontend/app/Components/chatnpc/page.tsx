export default function NpcChat({ sentence }: { sentence: string }) {
    return (
        <div style={{ position: "absolute", width: "98%", height: "30%", zIndex: 111, bottom: 0, left: "50%", transform: "translateX(-50%)", background: "rgb(0, 0, 0, 0.2)", color: "orange", fontFamily: "Courier New, monospace", fontSize: 24, padding: 20 }}>
            {sentence}
        </div>
    );
}