from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import re
import collections

app = FastAPI(title="MeetMind AI Python Microservice")

# Standard CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Segment(BaseModel):
    id: str
    speakerId: str
    speakerName: str
    text: str
    startTime: float
    endTime: float
    confidence: Optional[float] = 1.0

class AnalyzeRequest(BaseModel):
    transcript: List[Segment]

@app.get("/api/python/health")
def health():
    return {
        "status": "healthy",
        "language": "Python 3.11",
        "framework": "FastAPI",
        "features": ["local_sentiment_analysis", "keyword_density", "coaching_metrics"],
        "engine": "Python NLP Engine"
    }

@app.post("/api/python/analyze")
def analyze_transcript(req: AnalyzeRequest):
    if not req.transcript:
        return {
            "sentiment": "Neutral",
            "score": 50,
            "keywords": [],
            "coachingTips": ["No transcript segments available for Python NLP analysis."],
            "pythonEngineProcessed": True,
            "stats": {
                "totalWords": 0,
                "uniqueWords": 0,
                "positiveWordCount": 0,
                "negativeWordCount": 0
            }
        }
        
    full_text = " ".join([seg.text for seg in req.transcript])
    
    # 1. Local Sentiment Analysis (Rule-based)
    positive_words = {"good", "great", "excellent", "awesome", "perfect", "agree", "yes", "success", "resolved", "solved", "improving", "amazing", "happy", "excited", "progress", "on track", "delivered", "done", "clear", "helpful"}
    negative_words = {"bad", "issue", "problem", "blocker", "delayed", "fail", "failed", "failure", "cannot", "no", "difficult", "error", "bug", "wrong", "unable", "worry", "critical", "risk", "risks", "unclear", "slow", "broken"}
    
    words = re.findall(r'\b\w+\b', full_text.lower())
    pos_count = sum(1 for w in words if w in positive_words)
    neg_count = sum(1 for w in words if w in negative_words)
    
    total_sentiment_words = pos_count + neg_count
    sentiment = "Neutral"
    score = 50
    if total_sentiment_words > 0:
        score = int((pos_count / total_sentiment_words) * 100)
        if score > 60:
            sentiment = "Positive"
        elif score < 40:
            sentiment = "Critical"
        else:
            sentiment = "Mixed"
            
    # 2. Local Keyword Density
    stopwords = {"the", "a", "an", "and", "or", "but", "if", "then", "else", "to", "for", "in", "on", "at", "by", "of", "with", "about", "as", "from", "that", "this", "these", "those", "i", "you", "he", "she", "it", "we", "they", "me", "him", "her", "us", "them", "my", "your", "his", "their", "our", "is", "are", "was", "were", "be", "been", "have", "has", "had", "do", "does", "did", "can", "could", "will", "would", "should", "just", "so", "very", "also", "like", "actually", "know", "think", "mean", "get", "go", "got", "well", "how", "what", "who", "why"}
    
    filtered_words = [w for w in words if w not in stopwords and len(w) > 3]
    word_counts = collections.Counter(filtered_words)
    top_keywords = [{"text": word.capitalize(), "value": count} for word, count in word_counts.most_common(12)]
    
    # 3. Python-based Meeting Coaching Metrics
    num_segments = len(req.transcript)
    speaker_turns = {}
    for seg in req.transcript:
        speaker_turns[seg.speakerName] = speaker_turns.get(seg.speakerName, 0) + 1
        
    coaching_tips = []
    if len(speaker_turns) == 1:
        coaching_tips.append("Mono-speaker detected: The entire session was dominated by a single voice. Invite wider feedback or allocate interactive dialogue blocks next time.")
    elif len(speaker_turns) > 1:
        max_turns = max(speaker_turns.values())
        min_turns = min(speaker_turns.values())
        if max_turns > min_turns * 3:
            coaching_tips.append("High conversational imbalance: One speaker drove more than 3x the turns of others. Use round-robin updates or direct questions to bring passive listeners in.")
        else:
            coaching_tips.append("Excellent turn-taking: Conversational flow was distributed evenly. The dynamic dialogue indicates strong team alignment.")
            
    # Check avg segment length
    avg_len = sum(len(seg.text.split()) for seg in req.transcript) / num_segments if num_segments > 0 else 0
    if avg_len > 25:
        coaching_tips.append("Long presentation segments: Speakers averaged long monologues. Shorten individual inputs and insert quick checks to maintain audience engagement.")
    else:
        coaching_tips.append("Punchy interaction format: Quick, conversational exchanges keep energy levels high and promote agile decision making.")
        
    return {
        "sentiment": sentiment,
        "score": score,
        "keywords": top_keywords,
        "coachingTips": coaching_tips,
        "pythonEngineProcessed": True,
        "stats": {
            "totalWords": len(words),
            "uniqueWords": len(set(words)),
            "positiveWordCount": pos_count,
            "negativeWordCount": neg_count
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="127.0.0.1", port=8000, log_level="info")
