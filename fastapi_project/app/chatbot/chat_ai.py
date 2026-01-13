from langchain_community.llms import Ollama

# LLM simple
llm = Ollama(model="llama3:latest")

def simple_chat(question: str) -> str:
    """
    Chatbot simple : reçoit une question et renvoie la réponse.
    Pas de mémoire, pas de profil utilisateur.
    """
    # Appel direct à Ollama
    response = llm.predict(question)
    return response
