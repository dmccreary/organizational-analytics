# Quiz: Natural Language Processing

Test your understanding of NLP techniques for extracting meaning from organizational communications with these review questions.

---

#### 1. What is the primary purpose of tokenization in an NLP pipeline?

<div class="upper-alpha" markdown>
1. To assign sentiment scores to each word in a document
2. To break raw text into individual units that serve as input for downstream NLP operations
3. To classify documents into predefined categories based on content
4. To identify named entities such as people and organizations in text
</div>

??? question "Show Answer"
    The correct answer is **B**. Tokenization is the foundational NLP step that splits raw text into manageable units called tokens — typically words, subwords, or characters. Every subsequent NLP operation, from sentiment analysis to topic modeling, operates on these tokens. Poor tokenization corrupts all downstream processing, making it a critical first step in any organizational analytics NLP pipeline.

    **Concept Tested:** Tokenization

---

#### 2. Which tokenization strategy is most commonly used by modern large language models to handle corporate jargon and unfamiliar acronyms?

<div class="upper-alpha" markdown>
1. Character-level tokenization
2. Sentence-level tokenization
3. Subword tokenization (Byte Pair Encoding)
4. Word-level tokenization
</div>

??? question "Show Answer"
    The correct answer is **C**. Subword tokenization, such as Byte Pair Encoding (BPE), is used by most modern LLMs because it can decompose unfamiliar acronyms and compound terms into recognizable pieces. This makes it particularly well-suited for the jargon-heavy vocabulary of corporate communication, handling unknown words that word-level tokenizers would fail on entirely.

    **Concept Tested:** Tokenization

---

#### 3. Named Entity Recognition (NER) identifies "Acme Corp" mentioned across fifty email threads in three departments. What is the most valuable organizational analytics application of this finding?

<div class="upper-alpha" markdown>
1. Automatically creating a client node in the graph and connecting it to every employee who referenced it
2. Flagging the emails for legal compliance review
3. Computing the sentiment score for each mention of "Acme Corp"
4. Removing "Acme Corp" from future NLP analysis as a stop word
</div>

??? question "Show Answer"
    The correct answer is **A**. NER's primary organizational analytics value lies in extracting structured data from unstructured text to create new nodes and edges in the graph. When NER identifies "Acme Corp" across multiple threads and departments, you can automatically create a client node and connect it to every employee who referenced it, revealing client engagement patterns without manual tagging.

    **Concept Tested:** Named Entity Recognition

---

#### 4. A text classification model trained on email subject lines discovers that 60% of emails flowing into Engineering are classified as "Escalation," while only 15% going to Sales carry that label. What does this asymmetry most directly reveal?

<div class="upper-alpha" markdown>
1. There is an uneven distribution of organizational stress across departments
2. The Engineering team sends more emails than Sales
3. The classification model is biased toward Engineering emails
4. Sales has better communication practices than Engineering
</div>

??? question "Show Answer"
    The correct answer is **A**. When text classification reveals that escalation-type communications are disproportionately concentrated in one department, it tells a story about the uneven distribution of organizational stress. This asymmetry reveals pressure points that no org chart could show, suggesting that Engineering may be absorbing escalations that could be handled earlier in the workflow or distributed more evenly.

    **Concept Tested:** Text Classification

---

#### 5. What distinguishes sentiment scoring from sentiment analysis in organizational analytics?

<div class="upper-alpha" markdown>
1. Sentiment scoring is more accurate than sentiment analysis
2. Sentiment scoring assigns a continuous numerical value enabling mathematical aggregation, while sentiment analysis assigns categorical polarity labels
3. Sentiment scoring uses NER while sentiment analysis uses topic modeling
4. Sentiment scoring only works on email data while sentiment analysis works on all text
</div>

??? question "Show Answer"
    The correct answer is **B**. Sentiment analysis categorizes text into broad polarities (positive, negative, neutral), while sentiment scoring assigns a precise numerical value on a continuous scale from -1.0 to +1.0. This quantification is what makes sentiment operationally useful — it enables computing team averages, tracking trends over time, comparing channels, and correlating sentiment with outcomes like attrition.

    **Concept Tested:** Sentiment Scoring

---

#### 6. Two messages both receive a sentiment score of -0.6. One expresses worry about missing a deadline, and the other expresses frustration about changing requirements. Which NLP technique distinguishes between these two messages?

<div class="upper-alpha" markdown>
1. Topic modeling
2. Text classification
3. Sentiment scoring at the aspect level
4. Emotion detection
</div>

??? question "Show Answer"
    The correct answer is **D**. Emotion detection extends sentiment analysis by classifying text into specific emotional categories such as fear, anger, joy, and frustration. While both messages score identically on sentiment (-0.6), emotion detection identifies the first as fear and the second as anger — a distinction that matters because each emotion demands a different organizational response. Fear signals uncertainty; anger signals frustration with process.

    **Concept Tested:** Emotion Detection

---

#### 7. An analyst runs topic modeling on 10,000 organizational email subject lines and discovers word clusters like {budget, forecast, revenue, quarterly, fiscal}. What must the analyst do next to make this output useful?

<div class="upper-alpha" markdown>
1. Retrain the model with a larger dataset to improve accuracy
2. Assign an interpretive label to each discovered word cluster
3. Remove stop words from the clusters before presenting results
4. Convert the word clusters into word embeddings for further analysis
</div>

??? question "Show Answer"
    The correct answer is **B**. Topic modeling is an unsupervised technique that produces word clusters — it does not name the topics. The analyst must examine each cluster and assign an interpretive label (e.g., "Financial planning" for the budget/forecast/revenue cluster). This interpretation step is essential because the raw word clusters are meaningless to business stakeholders without human-assigned labels that connect the patterns to organizational context.

    **Concept Tested:** Topic Modeling

---

#### 8. In a word embedding space, the words "manager" and "supervisor" have vectors close together while "manager" and "sandwich" are far apart. What mathematical measure is typically used to quantify this similarity?

<div class="upper-alpha" markdown>
1. Cosine similarity of the word vectors
2. Euclidean distance between the raw word frequencies
3. Jaccard coefficient of shared character n-grams
4. Pearson correlation of document co-occurrence counts
</div>

??? question "Show Answer"
    The correct answer is **A**. Word embedding similarity is typically measured by the cosine of the angle between word vectors. This metric captures semantic similarity by comparing the direction of the vectors rather than their magnitude. The cosine similarity formula divides the dot product of two word vectors by the product of their magnitudes, producing a value from -1 to +1 that reflects how semantically related two words are.

    **Concept Tested:** Word Embeddings

---

#### 9. An organizational analytics team wants to extract sentiment, topic category, urgency level, and named entities from email subject lines simultaneously. Which approach is most efficient for this multi-task extraction?

<div class="upper-alpha" markdown>
1. Building four separate specialized NLP models, one for each extraction task
2. Using word embeddings to cluster the subject lines by similarity
3. Applying topic modeling with four distinct topic categories
4. Using a large language model to perform all four extractions in a single prompt
</div>

??? question "Show Answer"
    The correct answer is **D**. Large language models can perform multiple NLP tasks simultaneously through natural language prompting. By describing all four extraction tasks in a single prompt, the LLM returns structured output covering sentiment, topics, urgency, and entities in one inference — a task that would require four separate traditional NLP models. This multi-task capability is one of the key advantages LLMs bring to organizational analytics pipelines.

    **Concept Tested:** Large Language Models

---

#### 10. An analyst notices that communication tone between managers and their direct reports becomes significantly more formal and less empathetic when the employee is two levels below the manager. What type of organizational insight does this pattern reveal?

<div class="upper-alpha" markdown>
1. A measurement bias in the NLP pipeline's tone detection algorithm
2. Normal professional communication norms that vary by channel
3. A potential fear-based culture indicated by cross-hierarchical tone shifts
4. An indication that managers need additional communication training
</div>

??? question "Show Answer"
    The correct answer is **C**. Communication tone analysis evaluates style dimensions including formality, directness, and empathy. When tone shifts dramatically based on hierarchical distance — becoming more formal and less empathetic across levels — it may indicate a fear-based culture where employees modify their communication style based on power dynamics. This pattern is detectable only through systematic tone analysis, not by reading individual messages.

    **Concept Tested:** Communication Tone Analysis

---
