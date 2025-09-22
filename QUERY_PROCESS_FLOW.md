# 🔍 Alta New York Chatbot - Query Process Flow

## 📊 **How Your Query Gets Processed**

```
┌─────────────────────────────────────────────────────────────────┐
│                    🚀 USER QUERY PROCESS                        │
└─────────────────────────────────────────────────────────────────┘

1️⃣ USER INPUT
   "2 bedrooms in central park"
   ↓
   📱 Frontend (React)
   ↓
   🌐 HTTP POST to /api/chat/message
   ↓

2️⃣ BACKEND PROCESSING
   📡 ChatService.processMessage()
   ↓
   🔍 VectorService.searchKnowledge()
   ↓
   🤖 OpenAI Embedding API
   (Converts text to 1536-dimensional vector)
   ↓

3️⃣ PINECONE SEARCH
   🗄️ Pinecone Vector Database
   ├── central_park_properties_2025-09-18.json (1000+ properties)
   ├── rapidapi_listings.json (API data)
   ├── alta_listings.json (curated listings)
   └── user_uploaded_files (PDF, Word, Excel, JSON)
   ↓
   📊 Returns top 5 most similar vectors with scores
   ↓

4️⃣ CONTEXT EXTRACTION
   📋 Extract relevant property data:
   ├── Property details (price, beds, baths, sqft)
   ├── Address and location
   ├── Source files
   └── Metadata
   ↓

5️⃣ AI RESPONSE GENERATION
   🤖 OpenAI GPT-4
   ├── Uses extracted context
   ├── Generates natural language response
   └── Includes source citations
   ↓

6️⃣ RESPONSE TO USER
   📱 Frontend displays:
   ├── AI response
   ├── Source files used
   └── Property details (if applicable)
```

## 🎯 **Key Components**

### **Vector Search Process:**
1. **Query Embedding**: User text → 1536-dimensional vector
2. **Similarity Search**: Find closest matches in Pinecone
3. **Score Ranking**: Results ranked by similarity (0.8+ = very relevant)
4. **Context Building**: Extract relevant property data
5. **Response Generation**: AI creates natural language answer

### **Data Sources:**
- **Central Park Properties**: 1000+ real properties from Realtor.com API
- **RapidAPI Listings**: Live property data
- **User Uploads**: PDF, Word, Excel, JSON files
- **Curated Listings**: Alta New York property database

### **Search Quality:**
- **Semantic Understanding**: Finds meaning, not just keywords
- **Context Awareness**: Understands NYC real estate terminology
- **Source Attribution**: Shows which files provided the information
- **Real-time Data**: Uses latest property information

## 🔥 **Example Query Flow:**

**Input**: "2 bedrooms in central park"
**Process**: 
1. Embedding created for query
2. Pinecone finds similar property descriptions
3. Extracts Upper East Side Co-op details
4. AI generates: "For properties with 2 bedrooms around Central Park, I have a charming Upper East Side Co-op listed at 321 East 75th Street, New York, NY 10021. It features 2 bedrooms, 2 bathrooms, and 1,200 square feet of space. The price is $2,100,000."
**Sources**: alta_listings.json, rapidapi_listings.json

## ⚡ **Performance Benefits:**
- **Fast Search**: Vector similarity is milliseconds
- **Accurate Results**: Semantic understanding vs keyword matching
- **Scalable**: Can handle thousands of properties
- **Real-time**: Always uses latest data
