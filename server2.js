const connect = require('connect')
const http = require('http')
const serveStatic = require('serve-static')
const bodyParser = require('body-parser')
const router = require('./middleware/router')
const path = require('path')
const fs = require('fs')
const kmeans = require('simple-kmeans')
const skmeans = require('skmeans')
const TRAIN_PATH = path.join(path.resolve('./'), 'words', 'train');
const
	Distance = require("./node_modules/skmeans/distance.js"),
	eudist = Distance.eudist,
	dist = Distance.dist;


const randomSeeds = function (clusters,k) {
    var seeds = [];

    // populate seeds
    for (i=0; i < k; i++) {
        seeds.push(clusters[i]);
    }

    return seeds;
}

const countInArray = function (array, what) {
    var count = 0;
    for (var i = 0; i < array.length; i++) {
        if (array[i] === what) {
            count++;
        }
    }
    return count;
}

Array.prototype.contains = function(v) {
    for(var i = 0; i < this.length; i++) {
        if(this[i] === v) return true;
    }
    return false;
};

Array.prototype.unique = function() {
    var arr = [];
    for(var i = 0; i < this.length; i++) {
        if(!arr.contains(this[i])) {
            arr.push(this[i]);
        }
    }
    return arr;
}

function merge(left, right){

  var result = [],
      lLen = left.length,
      rLen = right.length,
      l = 0,
      r = 0;


  while(l < lLen && r < rLen){
    if(left[l] > right[r]){
       result.push(left[l++]);
     }
     else{
       result.push(right[r++]);
    }
  }
  //remaining part needs to be addred to the result
  return result.concat(left.slice(l)).concat(right.slice(r));
}

function mergeObjValue(left, right){

  var result = [],
      lLen = left.length,
      rLen = right.length,
      l = 0,
      r = 0;

  while(l < lLen && r < rLen){
    if(left[l].score > right[r].score){
       result.push(left[l++]);
     }
     else{
       result.push(right[r++]);
    }
  }
  //remaining part needs to be addred to the result
  return result.concat(left.slice(l)).concat(right.slice(r));
}

function mergeSort(arr,obj){

   var len = arr.length;
   if(len <2)
      return arr;

   var mid = Math.floor(len/2),
       left = arr.slice(0,mid),
       right =arr.slice(mid);
   //send left and right to the mergeSort to broke it down into pieces
   //then merge those
   if(obj) {
    return mergeObjValue(mergeSort(left,true),mergeSort(right,true));
   }
   else
    return merge(mergeSort(left),mergeSort(right));
}


var routes = {
	POST: {
		'/': function(req,res) {
			res.end('/')
		},
		'/process': function(req,res) {
			input  = req.body.input
			summary_size = req.body.percentage
   k_partition = req.body.k_partition

			// logic to split the senteces from the main input is here
			// re = /[^።•!\?፡]+([።!\?፡]+|$)/gm
   // re = /(\s*[\u1200-\u135A]+[-\/]?[\u1200-\u135A]\s?፡{0,1})+(።+|!+|\+|\?+|፡{2}|$)/gm
   // re = /([^።•!\?]+፡{0,1})+(።+|!+|\+|\?+|፡{2}|$)/gm
   re = /([^።•!\?፡]፡{0,1})+([።!\?፡]+|$)/gm
			var sentences = input.match(re),
			 	tf_idf = [],
				tf = {},
				idf = {},
				total_words = 0,
				total_documents = 6008,
				sentence_score = [],
    word_rank = [],
				sentence_length = []

			for (var i = sentences.length - 1; i >= 0; i--) {
				// any filters on the extracted sentences are put her
				// filter new line
				// sentences[i] = sentences[i].replace(/[\n]+/g,' ፤ ')

				// further breakdown the sentence into words
				let sentence = sentences[i],

      re = /[^\s።፤፣•፡፥\?!”“\u2039\u203A()-/]+[^\s።፤፣•፡፥\?!”“()\d\u2039\u203A]*[^\s።፤፣•፡፥\?!”“\u2039\u203A()-/\d]+/g,

					sentence_words = sentence.match(re)

				if(sentence_words != null) {
					sentence_length[i] = sentence_words.length

					for (var j = sentence_words.length - 1; j >= 0; j--) {
						if (!(sentence_words[j] in tf)) {
							tf[sentence_words[j]] = 1
						}
						else {
							tf[sentence_words[j]] += 1
						}

						total_words += 1
					}
				}
			}

		/*
				TF(t) = (Number of times term t appears in a document) / (Total number of terms in the document)
				IDF(t) = log_e(Total number of documents / Number of documents with term t in it).
				Value = TF * IDF
			*/

			var trained_data = JSON.parse(fs.readFileSync(`${TRAIN_PATH}.json`, { encoding: 'utf8' }))
			var score_sentences = {}


			/*
				TF(t) = (Number of times term t appears in a document) / (Total number of terms in the document)
				IDF(t) = log_e(Total number of documents / Number of documents with term t in it).
				Value = TF * IDF
			*/

			var current_document_word_frequency = JSON.parse(JSON.stringify(tf));


			// debugger;
			for (var j = sentences.length - 1; j >= 0; j--) {
				sentence_score[j] = 0

					let re = /[^\s።፤፣•፡፥\?!”“\u2039\u203A()-/]+[^\s።፤፣•፡፥\?!”“()\d\u2039\u203A]*[^\s።፤፣•፡፥\?!”“\u2039\u203A()-/\d]+/g,

					sentence = sentences[j]
					sentence_words = sentence.match(re)



				// we need RIDICULOUSNESS IN THE HOUSE
				// I am looping through every word for each sentence
				if(sentence_words != null) {
					for (var i = sentence_words.length - 1; i >= 0; i--) {
						tf[sentence_words[i]] = tf[sentence_words[i]]/total_words
						if (sentence_words[i] in trained_data){
							idf[sentence_words[i]] = trained_data[sentence_words[i]]
							idf[sentence_words[i]] = Math.log(total_documents / (1 + idf[sentence_words[i]]))
						}
						else {
							idf[sentence_words[i]] = 0
							idf[sentence_words[i]] = Math.log(total_documents / (1 + idf[sentence_words[i]]))
							console.log(sentence_words[i])
						}

						result = tf[sentence_words[i]]*idf[sentence_words[i]]
						sentence_score[j] = sentence_score[j] + (result)

					}
     sentence_score[j] = sentence_score[j]/sentence_words.length
				}

			}


			// score sentences object
			for (var j = 0; j < sentence_score.length; j++) {
				if (sentence_score[j] in score_sentences)
					score_sentences[sentence_score[j]].push(j)
				else
					score_sentences[sentence_score[j]] = [j]
			}

// Rank all the words
  for (var word in tf) {
   if (tf.hasOwnProperty(word) && idf.hasOwnProperty(word)) {
    score = tf[word]*idf[word]
    word_rank.push({'score':score,'word':word})
   }
  }



			/*
				Things to send back to the client
				- sentences list [sentences]
				- each sentences' scores [sentence_score & score_sentences]
				- words' and their tf-idf [tf,idf]
				- clusters sentences belong too [clusters, chosen_cluster]
				- and most importantly the summary (order should be put in the order put in the original document)
			*/

			// choosing k used to be like this
				// var k;
			// if (sentences.length <= 20)
			// 	k = sentences.length - 4
			// else
			// 	k = sentences.length - 20


   sorted  = mergeSort(sentence_score,false)

			init = []
			for (var i = 0; i < k_partition; i++) {
				init.push(sorted[Math.round(sorted.length/2)+i])
			}

			clusters = skmeans(sentence_score,k_partition,init)
   it = clusters.it
			console.log('initial centroids',init)
			console.log('actual centroids',clusters.centroids)


			maxLength = clusters.centroids[0]
			cluster_indexes = clusters.idxs.unique()
   chosen_index = 0


			for (var i = 0; i < clusters.centroids.length; i++) {
				if(clusters.centroids[i] > maxLength) {
					maxLength = clusters.centroids[i]
					chosen_index = i
				}

			}

			maxLength = countInArray(clusters.idxs,chosen_index)
   word_rank = mergeSort(word_rank,true)
   // word_rank = word_rank.slice(0,150)
			indexes = []

			summary_size = Math.round(summary_size/100 * sentences.length)

			for (var i = 0; i < summary_size; i++) {
				indexes.push(score_sentences[sorted[i]])

				s = {'content':sentences[score_sentences[sorted[i]]], 'rank':i}
				sentences[score_sentences[sorted[i]]] = s
			}

			indexes = mergeSort(indexes,false)
			order = indexes




			let total_word_frequency = JSON.parse(fs.readFileSync(path.join(path.resolve('./'), 'words', 'frequency.json')), { encoding: 'utf8' })

			var output = {
				'total_words':total_words,
				'clusters': clusters,
				'sentences': sentences,
				'cluster_summary_size': maxLength,
				'summary_size': summary_size,
				'sentence_scores': sentence_score,
				'order': order,
				'score_sentences': score_sentences,
				'tf': tf,
    'word_rank': word_rank,
				'idf': idf,
				'chosen_index': chosen_index,
    'sorted':sorted,
				'word_document_frequency': trained_data,
				'total_word_frequency': total_word_frequency,
				'current_document_word_frequency': current_document_word_frequency,
				'k':k_partition,
    'it':it
			}


			output = JSON.stringify(output)

			res.end(output)

		}
	}
}

connect()
	.use(serveStatic('public'))
	.use(bodyParser.urlencoded({
    extended: true
}))

/**bodyParser.json(options)
 * Parses the text as JSON and exposes the resulting object on req.body.
 */
.use(bodyParser.json())
	.use(router(routes))
	.listen(3000)
