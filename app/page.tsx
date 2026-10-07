"use client";

import { useMemo, useState } from "react";
import { calculateProfile, GRID, NumerologyProfile } from "../lib/numerology";

type Message = { role: "user" | "assistant"; content: string };

const starterQuestions = [
  "What does my Mulank say about my career?",
  "What kind of partner suits my numbers?",
  "Which period is better for a career change?",
  "What should I focus on financially?"
];

export default function Home() {
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [profile, setProfile] = useState<NumerologyProfile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [used, setUsed] = useState(0);
  const [plan, setPlan] = useState<"free" | "starter" | "pro">("free");

  const limit = plan === "free" ? 3 : plan === "starter" ? 30 : 100;

  const remaining = Math.max(0, limit - used);

  const greeting = useMemo(() => {
    if (!profile) return "Know your numbers. Understand your patterns.";
    return `Hi ${profile.name.split(" ")[0] || "there"}. What would you like to understand today?`;
  }, [profile]);

  function createProfile() {
    if (!name.trim() || !dob) return;
    setProfile(calculateProfile(name.trim(), dob));
    setMessages([]);
    setUsed(0);
  }

  async function ask(question = input) {
    const text = question.trim();
    if (!text || !profile || loading || remaining <= 0) return;

    const userMessage: Message = { role: "user", content: text };
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile,
          message: text,
          history: messages
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");

      setMessages([...nextMessages, { role: "assistant", content: data.answer }]);
      setUsed((n) => n + 1);
    } catch (e) {
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content: e instanceof Error ? e.message : "Something went wrong."
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="logo">M</div>
          <div>
            <strong>MAUKSH AI</strong>
            <span>Numerology Intelligence</span>
          </div>
        </div>

        <button className="newChat" onClick={() => setMessages([])}>
          <span>＋</span> New conversation
        </button>

        <div className="sideSection">
          <span className="sideLabel">Your profile</span>
          {profile ? (
            <div className="profileMini">
              <b>{profile.name}</b>
              <span>Mulank {profile.mulank} · Bhagyank {profile.bhagyank}</span>
            </div>
          ) : (
            <p className="muted">Create your numerology profile to begin.</p>
          )}
        </div>

        <div className="sideBottom">
          <span>Questions remaining</span>
          <strong>{remaining} / {limit}</strong>
          <div className="meter">
            <div style={{ width: `${(remaining / limit) * 100}%` }} />
          </div>
          <button className="upgrade" onClick={() => setPlan(plan === "pro" ? "free" : "pro")}>
            {plan === "pro" ? "Pro active" : "Upgrade to Pro · ₹99"}
          </button>
        </div>
      </aside>

      <section className="main">
        <header className="topbar">
          <div className="mobileBrand">
            <div className="logo small">M</div>
            <b>MAUKSH AI</b>
          </div>
          <div className="planBadge">
            {plan === "free" ? "Free" : plan === "starter" ? "₹49 · 30/month" : "₹99 · 100/month"}
          </div>
        </header>

        {!profile ? (
          <div className="onboarding">
            <div className="heroGlow" />
            <div className="eyebrow">PERSONAL NUMEROLOGY AI</div>
            <h1>Your numbers.<br /><em>Your questions.</em></h1>
            <p className="heroText">{greeting}</p>

            <div className="profileCard">
              <div className="cardTitle">Create your numerology profile</div>
              <label>
                Full name
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full birth name" />
              </label>
              <label>
                Date of birth
                <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
              </label>
              <button className="primary" onClick={createProfile} disabled={!name || !dob}>
                Calculate my numbers <span>→</span>
              </button>
              <small>Your data is used to personalize your numerology experience.</small>
            </div>

            <div className="trustRow">
              <span>✦ Vedic grid</span>
              <span>✦ Personalized answers</span>
              <span>✦ No guaranteed predictions</span>
            </div>
          </div>
        ) : (
          <div className="chatShell">
            <div className="chatHeader">
              <div>
                <span className="eyebrow">PERSONAL SESSION</span>
                <h2>{greeting}</h2>
              </div>
              <button className="profileButton" onClick={() => setProfile(null)}>Edit profile</button>
            </div>

            <div className="numbersStrip">
              <div><span>Mulank</span><b>{profile.mulank}</b></div>
              <div><span>Bhagyank</span><b>{profile.bhagyank}</b></div>
              <div><span>Name</span><b>{profile.nameNumber}</b></div>
              <div className="gridTiny">
                {GRID.flat().map((n) => <i key={n}>{n}</i>)}
              </div>
            </div>

            <div className="messages">
              {messages.length === 0 && (
                <div className="emptyChat">
                  <div className="spark">✦</div>
                  <h3>Ask anything about your numbers</h3>
                  <p>Mauksh AI uses your numerology profile to make every answer personal.</p>
                  <div className="suggestions">
                    {starterQuestions.map((q) => (
                      <button key={q} onClick={() => ask(q)}>{q}<span>→</span></button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m, i) => (
                <div key={i} className={`message ${m.role}`}>
                  <div className="avatar">{m.role === "user" ? "You" : "M"}</div>
                  <div className="bubble">{m.content}</div>
                </div>
              ))}

              {loading && (
                <div className="message assistant">
                  <div className="avatar">M</div>
                  <div className="bubble typing"><i /><i /><i /></div>
                </div>
              )}
            </div>

            <div className="composerWrap">
              {remaining === 0 && (
                <div className="limitNotice">
                  You&apos;ve used this month&apos;s questions. <b>Upgrade to Pro for 100 questions.</b>
                </div>
              )}
              <div className="composer">
                <textarea
                  value={input}
                  disabled={remaining === 0 || loading}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      ask();
                    }
                  }}
                  placeholder="Ask Mauksh AI about your numbers..."
                  rows={1}
                />
                <button onClick={() => ask()} disabled={!input.trim() || loading || remaining === 0}>↑</button>
              </div>
              <div className="composerFooter">
                <span>AI guidance is for reflection and entertainment, not certainty.</span>
                <span>{remaining} questions left</span>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}