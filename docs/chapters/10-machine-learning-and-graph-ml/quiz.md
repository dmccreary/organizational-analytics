# Quiz: Machine Learning and Graph ML

Test your understanding of machine learning fundamentals and graph-specific ML techniques for organizational analytics with these review questions.

---

#### 1. What is the key requirement that distinguishes supervised learning from unsupervised learning?

<div class="upper-alpha" markdown>
1. Supervised learning requires labeled historical data with known outcomes
2. Supervised learning requires graph-structured data while unsupervised learning uses tabular data
3. Supervised learning uses neural networks while unsupervised learning uses clustering
4. Supervised learning is more accurate than unsupervised learning in all cases
</div>

??? question "Show Answer"
    The correct answer is **A**. The defining characteristic of supervised learning is that it trains on labeled examples — data points where the correct answer is already known. For flight risk prediction, this means historical records of employees who left (positive class) and employees who stayed (negative class). The model learns the relationship between input features and outcomes, then applies those patterns to new, unseen data.

    **Concept Tested:** Supervised Learning

---

#### 2. An HR analytics team discovers informal employee groups that do not appear on any org chart by analyzing communication patterns without predefined categories. Which machine learning approach did they use?

<div class="upper-alpha" markdown>
1. Supervised classification with department labels
2. Unsupervised learning through clustering
3. Graph neural network with message passing
4. Gradient boosted tree regression
</div>

??? question "Show Answer"
    The correct answer is **B**. Unsupervised learning excels at discovery tasks where you don't tell the algorithm what to look for. Clustering employees by communication patterns and collaboration networks — without predefined team labels — reveals informal groups that emerge from actual work relationships. Techniques like K-means, hierarchical clustering, and DBSCAN can discover these hidden structures that formal organizational charts never capture.

    **Concept Tested:** Unsupervised Learning

---

#### 3. When building a flight risk prediction model, an analyst includes "spike in recruiter website visits during the employee's notice period" as a feature. Why is this problematic?

<div class="upper-alpha" markdown>
1. Recruiter website data is protected by privacy regulations
2. Website visit data is too noisy to be a reliable predictor
3. This feature would cause the model to underfit the training data
4. This creates data leakage because the feature uses information from after the prediction window
</div>

??? question "Show Answer"
    The correct answer is **D**. This is a classic case of data leakage (also called feature leakage). When predicting whether an employee will leave in the next six months, you must only use features available before the prediction window. Data from the notice period — when someone is already leaving — inflates model performance artificially. The model will appear brilliant in testing but fail in production because those features are unavailable at prediction time.

    **Concept Tested:** Feature Engineering

---

#### 4. A flight risk model flags 50 employees as likely to leave. Of those 50, only 15 actually depart, while 35 were false alarms. Meanwhile, 10 employees who were not flagged also leave. Which metric would best capture the model's ability to identify the employees who actually left?

<div class="upper-alpha" markdown>
1. Precision, which measures 15/(15+35) = 30%
2. Accuracy, which measures (15+remaining TN)/total
3. F1 score, which balances precision and recall equally
4. Recall, which measures 15/(15+10) = 60%
</div>

??? question "Show Answer"
    The correct answer is **D**. Recall measures the proportion of actual positive cases (employees who left) that the model correctly identified: 15 true positives out of 25 total departures (15 caught + 10 missed) = 60%. In HR contexts, recall answers "Of everyone who actually left, how many did we catch?" This is critical because false negatives — missed departures — represent employees the organization could have retained with timely intervention.

    **Concept Tested:** Training and Evaluation

---

#### 5. In a graph neural network, what does the message passing mechanism accomplish at each layer?

<div class="upper-alpha" markdown>
1. It transmits raw email content between connected employee nodes
2. It removes low-weight edges to simplify the graph structure
3. Each node gathers, aggregates, and incorporates feature information from its neighbors to update its own representation
4. It assigns community labels to each node based on modularity optimization
</div>

??? question "Show Answer"
    The correct answer is **C**. Message passing is the core mechanism of GNNs. At each layer, every node gathers feature information from its neighbors, aggregates that information (through summing, averaging, or attention), and updates its own representation by combining its current features with the aggregated neighbor information. After multiple layers, each node's representation encodes information about its multi-hop neighborhood — capturing the relational context essential for organizational analytics.

    **Concept Tested:** Graph Neural Networks

---

#### 6. Why does Node2Vec use biased random walks rather than uniform random walks like DeepWalk?

<div class="upper-alpha" markdown>
1. Biased walk parameters let you control whether walks emphasize local neighborhood structure or global structural roles
2. Biased walks run faster on large organizational graphs
3. Uniform walks cannot generate enough training data for the skip-gram model
4. Biased walks automatically exclude low-degree nodes from the embedding space
</div>

??? question "Show Answer"
    The correct answer is **A**. Node2Vec extends DeepWalk by introducing bias parameters that control the random walk behavior. These parameters let you tune whether walks stay close to the starting node (emphasizing local clustering and team dynamics) or explore farther afield (emphasizing global structural roles like bridge positions). This flexibility is particularly valuable for organizational networks where both local team dynamics and cross-organizational roles matter.

    **Concept Tested:** Node Embeddings

---

#### 7. An organizational analyst wants to predict which pairs of currently unconnected employees are most likely to collaborate in the future. Which graph ML task type should they use?

<div class="upper-alpha" markdown>
1. Node classification
2. Graph classification
3. Link prediction
4. Community detection
</div>

??? question "Show Answer"
    The correct answer is **C**. Link prediction answers the question "Where will new connections form?" by scoring pairs of unconnected nodes and ranking them by likelihood of forming a connection. For organizational analytics, this enables predicting future collaborations, anticipating mentoring relationships, identifying potential cross-department bridges, and forecasting how restructuring will affect collaboration patterns.

    **Concept Tested:** Link Prediction

---

#### 8. Graph classification differs from node classification because it assigns labels to which unit of analysis?

<div class="upper-alpha" markdown>
1. Individual edges between two employees
2. Individual node features like tenure and performance rating
3. Entire graphs or subgraphs such as teams or departments
4. Clusters of word embeddings from communication text
</div>

??? question "Show Answer"
    The correct answer is **C**. Graph classification operates at a higher level of abstraction than node or edge classification. Instead of labeling individual employees or relationships, it assigns labels to entire graphs or subgraphs — such as classifying a team's communication network as high-performing, average, or underperforming based on its internal structure, density, and connectivity patterns.

    **Concept Tested:** Graph Classification

---

#### 9. A flight risk model trained on historical data predicts that employees in a certain demographic group are higher risk. Managers invest less in those employees, who then leave at higher rates, which further reinforces the model's predictions. What is this phenomenon called?

<div class="upper-alpha" markdown>
1. Feature leakage
2. A bias feedback loop
3. Algorithmic optimization bias
4. Overfitting to the training distribution
</div>

??? question "Show Answer"
    The correct answer is **B**. A bias feedback loop occurs when biased model predictions influence real-world decisions, which generate biased outcomes, which then become training data that reinforces the original bias. This self-reinforcing cycle is particularly insidious because the model's predictions appear to be validated by outcomes — outcomes the model itself helped create. Breaking these loops requires fairness-aware algorithms, human review, and regular bias audits.

    **Concept Tested:** Bias in Analytics

---

#### 10. An organization wants to ensure its flight risk model performs equitably. Which mitigation strategy should be applied during the model evaluation phase?

<div class="upper-alpha" markdown>
1. Remove all demographic features from the training data
2. Train the model on a larger dataset to improve overall accuracy
3. Use only unsupervised learning algorithms that do not require labels
4. Test whether accuracy and error rates are consistent across demographic groups through a fairness audit
</div>

??? question "Show Answer"
    The correct answer is **D**. A fairness audit during evaluation checks whether the model's accuracy and error rates (precision, recall, false positive rates) are consistent across gender, race, age, and other protected characteristics. Simply removing demographic features (option A) is insufficient because proxy features can still encode demographic information. A model optimized for overall accuracy may perform well for majority groups but poorly for underrepresented groups — a disparity only a fairness audit can detect.

    **Concept Tested:** Bias in Analytics

---
