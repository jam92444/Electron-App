import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const WelcomePage = () => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#ff6b2b 0%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Georgia', 'Times New Roman', serif",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Decorative blobs */}
      <div style={{
        position: "absolute", top: "-80px", left: "-80px",
        width: "340px", height: "340px",
        borderRadius: "50%",
        background: "rgba(255,255,255,0.10)",
        filter: "blur(2px)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "-60px", right: "-60px",
        width: "260px", height: "260px",
        borderRadius: "50%",
        background: "rgba(255,255,255,0.08)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", top: "50%", left: "8%",
        width: "80px", height: "80px",
        borderRadius: "50%",
        background: "rgba(255,255,255,0.07)",
        pointerEvents: "none",
      }} />

      {/* Card */}
      <div
        style={{
          background: "rgba(255,255,255,0.15)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1.5px solid rgba(255,255,255,0.30)",
          borderRadius: "28px",
          padding: "60px 56px 52px",
          maxWidth: "520px",
          width: "90%",
          boxShadow: "0 8px 48px rgba(200,80,0,0.18), 0 1.5px 0 rgba(255,255,255,0.18) inset",
          textAlign: "center",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(28px)",
          transition: "opacity 0.7s cubic-bezier(.4,0,.2,1), transform 0.7s cubic-bezier(.4,0,.2,1)",
        }}
      >
        {/* Icon */}
        <div style={{
          width: "64px", height: "64px",
          background: "rgba(255,255,255,0.25)",
          borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 28px",
          fontSize: "28px",
          boxShadow: "0 2px 12px rgba(200,80,0,0.15)",
        }}>
          🌟
        </div>

        {/* Eyebrow */}
        <p style={{
          fontSize: "12px",
          fontFamily: "'Trebuchet MS', sans-serif",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.75)",
          marginBottom: "16px",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.8s 0.2s",
        }}>
          Welcome aboard
        </p>

        {/* Headline */}
        <h1 style={{
          fontSize: "clamp(2rem, 6vw, 3rem)",
          fontWeight: "700",
          color: "#fff",
          lineHeight: "1.15",
          margin: "0 0 20px",
          letterSpacing: "-0.02em",
          textShadow: "0 2px 16px rgba(180,60,0,0.18)",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.8s 0.25s",
        }}>
          We're glad<br />you're here.
        </h1>

        {/* Body */}
        <p style={{
          fontSize: "1.07rem",
          color: "rgba(255,255,255,0.88)",
          lineHeight: "1.7",
          margin: "0 0 40px",
          fontFamily: "'Trebuchet MS', sans-serif",
          fontWeight: "400",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.8s 0.35s",
        }}>
          Everything you need is just a step away.<br />
          Let's get you started on the right foot.
        </p>

        {/* CTA */}
        <div style={{
          display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.8s 0.45s",
        }}>
          <button
            onClick={() => navigate("/")}
            style={{
              background: "#fff",
              color: "#e85d04",
              border: "none",
              borderRadius: "50px",
              padding: "14px 36px",
              fontSize: "0.95rem",
              fontWeight: "700",
              fontFamily: "'Trebuchet MS', sans-serif",
              letterSpacing: "0.04em",
              cursor: "pointer",
              boxShadow: "0 4px 20px rgba(200,80,0,0.18)",
              transition: "transform 0.18s, box-shadow 0.18s, background 0.18s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-2px) scale(1.03)";
              e.currentTarget.style.boxShadow = "0 8px 28px rgba(200,80,0,0.28)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "";
              e.currentTarget.style.boxShadow = "0 4px 20px rgba(200,80,0,0.18)";
            }}
          >
            Get Started →
          </button>

  
        </div>
      </div>
    </main>
  );
};

export default WelcomePage;