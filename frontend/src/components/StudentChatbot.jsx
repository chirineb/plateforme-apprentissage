import { useState } from "react";

export default function StudentChatbot() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!question.trim()) return;

    setLoading(true);
    setAnswer("");

    try {
      const res = await fetch("http://127.0.0.1:8000/chatbot/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      });

      if (!res.ok) throw new Error("Erreur serveur");

      const data = await res.json();
      setAnswer(data.answer || "Pas de réponse trouvée");
    } catch (err) {
      setAnswer("❌ Erreur lors de la réponse du serveur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Chatbox */}
      {open && (
        <div className="fixed bottom-24 right-6 w-96 bg-white shadow-xl rounded-xl flex flex-col z-50">
          {/* Header */}
          <div className="bg-blue-600 text-white p-3 rounded-t-xl flex justify-between items-center">
            <span>🤖 Chatbot Simple</span>
            <button onClick={() => setOpen(false)}>✖</button>
          </div>

          {/* Answer */}
          <div className="p-4 h-40 overflow-y-auto flex items-center justify-center">
            {loading ? (
              <p className="text-gray-400">🤖 réfléchit...</p>
            ) : (
              <p>{answer}</p>
            )}
          </div>

          {/* Input */}
          <div className="p-2 flex gap-2 border-t">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Écris ta question..."
              className="flex-1 border rounded px-3 py-2 text-sm"
            />
            <button
              onClick={sendMessage}
              className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700"
            >
              ➤
            </button>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg text-2xl flex items-center justify-center hover:bg-blue-700 z-50"
      >
        💬
      </button>
    </>
  );
}
