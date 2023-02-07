
$('document').ready(function() {
	var words
	$('#top_words').hide()
	$("#textarea #text").hide()
	function divideTextInSpans(text){
		if (text) {
	   return $.map(text.split(/([\s።፤፣፡፥•\?!”“()]+)/), function(word,x,y){
	   	  if (word.match(/[\s።፤፣፡፥•\?!”“()\d]+/) || word==""){
	      	return word
							}
	      else {
								console.log(word)
								words = words+1

	      	return '<span class="word">'+word+'</span>';
							}
	   }).join(' ');
			}
	}

	$('#re-input').click(function() {
		$("#textarea #text").hide()
		$('textarea').show().focus().select()
		$("#textarea textarea").css({'opacity':'1'})

	})

	$('textarea').focus().select()

	$('#submit').click(function() {
		var input_text = $("#textarea textarea").val()
		$("#textarea #text").hide()
		$("#textarea textarea").show()
		$("#textarea textarea").css({'opacity':'0.3'})

		words = 0

		if (input_text) {
			var summary_size = $('#summary_size').val(),
							k_partition = $('#k_partition').val()

			if(!k_partition)
				k_partition = 2

			var use_k_means = $('#use_k_means').is(':checked')
			if(use_k_means)
				percentage_extraction = '101'
			else {
				percentage_extraction = summary_size
			}

			$.post('process',{input:input_text,percentage: percentage_extraction,k_partition:k_partition})
			.done(function(response) {
				$('#textarea textarea').hide()
				$('#textarea #text').show()

				output = JSON.parse(response)
				console.log(output.word_rank)
				var summary = '', total_sentences = output.sentences.length

				if(!use_k_means){
					$('#extraction').html(summary_size)
					$('#k_means').hide()

					for (index in output.order) {


						for (var i = 0; i < output.order[index].length; i++) {
							sentence = output.sentences[output.order[index][i]]

							if(sentence){
								rank = sentence['rank'] +1
								sentence = divideTextInSpans(sentence['content'])
								summary = '<span class="sentence" order="'+i+1+'" id="'+output.order[index][i]+'" length="'+output.sentence_word_length[output.order[index][i]]+'" rank="'+rank+'/'+output.summary_sentences+'" score="'+output.sentence_scores[output.order[index][i]]+'" >'+sentence+ '</span> ' + summary
							}
						}
					}
					console.log('number of words',words)

				$('#summary_sentences').html(output.summary_sentences)

					$('#cluster').html('None')
				}
				else {

					$('#k_means').show()
					for (var i = output.clusters.idxs.length - 1; i >= 0; i--) {
						if (output.clusters.idxs[i] == output.chosen_index) {
							sentence = output.sentences[i]

							if(sentence) {
								rank = sentence['rank'] +1
								sentence = divideTextInSpans(sentence['content'])

								summary = '<span class="sentence" id="'+i+'" length="'+output.sentence_word_length[i]+'" rank="'+rank+'/'+output.cluster_summary_size+'" score="'+output.sentence_scores[i]+'" >'+sentence+ '</span> ' + summary
							}
						}
					}

					extraction = words/output.total_words
					extraction = extraction*100
					console.log('number of words',words)


					$('#summary_sentences').html(output.cluster_summary_size)
					$('#extraction').html(Math.round(extraction))
					$('#cluster').html(output.chosen_index)
				}

				$('#k_value').html(k_partition)
				$('#it').html(output.it)
				$('#summary_words').html(words)

				if(!k_partition)
						k_partition = 3
					else {
						k_partition = Number(k_partition)
						k_partition = k_partition+1
					}

				if(use_k_means && extraction > summary_size && k_partition<10){
						$('#k_partition').val(k_partition)
						$('#submit').click()
						return false
					}
					else {
						$('#k_partition').val(2)
					}

				$('#total_sentences').html(total_sentences)
				$('#total_words').html(output.total_words)

				$('#textarea #text').html(summary)

				$('#sortable').html('')
				for (var w in output.word_rank) {
					$('#sortable').append('<li class="bucketrow" title="'+output.word_rank[w].score+'">'+output.word_rank[w].word+'</li>')
				}
				$('#top_words').show()


				$('.sentence').hover(function() {
					score = $(this).attr('score')
					id = $(this).attr('id')
					rank = $(this).attr('rank')
					word_length = $(this).attr('length')

					$('.sentence.active').removeClass('active')
					$(this).addClass('active')

					$('#sentence_score').html(score)
					$('#sentence_id').html(id)
					$('#sentence_rank').html(rank)
					$('#sentence_word_length').html(word_length)
				})

				$('.word').hover(function() {
					word = $(this).html()

					$('.word.active').removeClass('active')
					$(this).addClass('active')

					$('#word').html(word)
					let tf=null, idf=null
					// tf
					if (word in output.tf){
						$('#tf').html(output.tf[word])
						tf = output.tf[word]
					}
					else{
						$('#tf').html('-')
					}

					// idf
					if (word in output.idf){
						$('#idf').html(output.idf[word])
						idf = output.idf[word]
					}
					else
						$('#idf').html('-')

					// word frequency
					if (word in output.word_document_frequency)
						$('#word_document_frequency').html(output.word_document_frequency[word])
					else
						$('#word_document_frequency').html('-')

					if(word in output.total_word_frequency)
						$('#total_word_frequency').html(Math.round(output.total_word_frequency[word]))
					else
						$('#total_word_frequency').html('-')

					if(word in output.current_document_word_frequency)
						$('#current_document_word_frequency').html(output.current_document_word_frequency[word])
					else
						$('#current_document_word_frequency').html('-')

					// tf-idf
					if(!tf || !idf)
						score = '-'
					else
						score = tf*idf

					$('#tf_idf').html(score)

				})
			})
		}

		// if
	})
})
