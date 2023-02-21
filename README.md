# Summerrain-Amharic-news-summarizer

The summarizer is an unsupervised and extractive working on news articles written in Amharic. 
Although the methods tested in this research can be used for generic summarization, the considered training corpus and test cases are restricted to Amharic news documents.

The extractive summarizer is implemented with the goal of selecting the most important sentences from an input document. In order to achieve this, all the sentences should be equally analyzed. The sentences should first be segmented. This can be achieved by detecting common sentence separators found in Amharic language. Each sentences are then analyzed on word level and ranked to calculate their relevance score. The relevance score is the most crucial measurement that determines whether a sentence is fit or not to be included in the final summary.

The input text goes through four processes -sentence segmentation, tokenization, TF-IDF scoring, clustering and finally outputting the summary sentences in the order presented in the original text.
Given an input the first thing the prototype does is do a sentence segmentation. Sentence segmentation is picking out each and every sentence. The segmentation is done by looking at the patterns behind common sentence separators in Amharic text. The following rules are used for the tokenization and sentence segmentation in a regular expression:

1. ፡፡| ::|።| ? and new line are taken as separators for sentences.
2. There is one tricky situation involving quotations; quotes should be part of a sentence even if they contain the stated delimiters. For example - የ ዲሞክራሲፈንድን በተመለከተአቶዘርዐይ፤ “መንግስትን ሲያብጠለጥሉለሚውሉ ሚዲያዎችእንዴትነ ውየ ዲሞክራሲፈንድየ ሚሰጠው?” ሲሉጠይቀዋል፡፡ this should be considered as one sentence without singling out the quoted text.
3. Any punctuation is removed from terms when counting occurrences or computing score except of compound words and abbreviations like ት/ቤት፣ ቤተ-መጽሃፍት which are identified as one word by looking at the - and / separators.
4. One letter alone is not considered a word; even coupled with some other punctuation like in ኤፍቢ ሲand ለ).
5. Number digits alone or coupled with some other punctuation are also not considered a word. But numbers coupled with a letter like 1ኛis considered.
6. Other language letters like English is completely discarded from the scoring
After the sentences are segmented each sentences will be tokenized. The tokenization rules is the same as the one used for the web scraper. The tokenization process create a bag of words for each sentence.
Next step is sentence scoring where TF-IDF of each words for every sentence is calculated. Scores for every sentence will then be assigned by summing all the TF-IDF value of the words found in the sentence. Given an input of Amharic news article, the sentences are first tokenized. Each token’s TF- IDF will then be calculated. The scores for each tokens will be aggregated to be assigned for the sentence they belong to.


<img width="406" alt="Screenshot 2023-02-21 at 10 16 42 AM" src="https://user-images.githubusercontent.com/5771578/220274586-1e2c603b-f00d-413d-b8b3-9a35baa07d16.png">


The fourth and final process is clustering. K-means algorithm is used to cluster the sentences. The sentences will be represented by their TF-IDF total score calculated in the previous step. And k which is the number of clusters is always set to two because we are looking to get two clusters for our application; set of sentences to be included in the summary and the rest of sentences to be left out of the summary. The cluster with the bigger centroid value is selected as a summary. 

# Running the server

```
node server.js
```

# UI

<img width="1377" alt="Screenshot 2023-02-21 at 10 15 54 AM" src="https://user-images.githubusercontent.com/5771578/220274395-36bfa3f5-5f2e-404b-84b1-35dc3fc554cf.png">
