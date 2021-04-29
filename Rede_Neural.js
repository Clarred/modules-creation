(
	function ( global, factory ){

		( global = global || self, factory( global.Neural = {} ) );

	}(this, function ( exports ){

		const Learning_Rate = 0.1;

		class Matrix{
			constructor ( lines, columns ){

				this.lines = lines;
				this.columns = columns;
				this.matrix = new Array( lines );
				this.type = "Matrix";

				for ( var i = 0; i < this.lines; i++ ){

					this.matrix[ i ] = new Array();

					for ( var ii = 0; ii < this.columns; ii++ ){

						this.matrix[ i ][ ii ] = 0;

					}

				}

			}

			Inject( arr ){

				var c = 0;
				for ( var a = 0; a < this.lines; a++ ){

					for ( var b = 0; b < this.columns; b++ ){

						this.matrix[a][b] = arr[c];
						c++;
					}

				}

			}

			static Multiply( mtx1, mtx2 ){


				var k = 0;
				var arr = new Matrix( mtx1.lines, mtx2.columns );

				for (var a = 0; a < mtx2.columns; a++ ){//add Column lay2

				    for ( var b = 0; b < mtx1.lines; b++ ){//add Line lay1

				        for ( var c = 0; c < mtx1.columns; c++ ){//add Column lay1

				            k += mtx1.matrix[b][c] * mtx2.matrix[c][a];

				            //console.log( "Agora multiplicando:\n["+b+"]["+c+"]\nValor:"+mtx1.matrix[b][c]+" \nX \n["+c+"]["+a+"]\nValor: "+mtx2.matrix[c][a]+" : \nAcumulado ( k ) -> "+k);

				        }

				        arr.matrix[b][a] = k;
				        k = 0;

				    }

				}

				return arr;

			}

			static Add( mtx1, mtx2 ){//type Matrix

				var arr = new Matrix( mtx1.lines, mtx2.columns );

				/*console.log( mtx1 );
				console.log( mtx2 );*/

				for ( var a = 0; a < mtx1.lines; a++ ){

					for ( var b = 0; b < mtx2.columns; b++ ){

						arr.matrix[a][b] = mtx1.matrix[a][b] + mtx2.matrix[a][b];

					}

				}

				return arr;

			}

			static Subtract( mtx1, mtx2 ){//type Matrix

				var arr = new Matrix( mtx1.lines, mtx2.columns );

				for ( var a = 0; a < mtx1.lines; a++ ){

					for ( var b = 0; b < mtx2.columns; b++ ){
							
						arr.matrix[a][b] = mtx1.matrix[a][b] - mtx2.matrix[a][b];

					}

				}

				return arr;

			}

			static Transpose( mtx ){

				var newMtx = new Matrix( mtx.columns, mtx.lines );
				for ( var a = 0; a < mtx.columns; a++ ){
					for ( var b = 0; b < mtx.lines; b++ ){
						newMtx.matrix[a][b] = mtx.matrix[b][a];
					}
				}


				return newMtx;

			}

			static Hadamard( mtx1, mtx2 ){ //type Matrix

				var mtxR = new Matrix( mtx1.lines, mtx2.columns );
				for ( var a = 0; a < mtx1.lines; a++ ){

					for ( var b = 0; b < mtx1.columns; b++ ){

						mtxR.matrix[a][b] = mtx1.matrix[a][b] * mtx2.matrix[a][b];

					}

				}

				return mtxR;
			
			}

			static ScalarMatrix( mtx, scalar ){
				var matrix = new Matrix( mtx.lines, mtx.columns );

				matrix.matrix = mtx.matrix.map( ( arr, i ) => {
					return arr.map( ( elm, j ) => {
						return elm * scalar;
					} );
				});

				return matrix;

			}

			static map ( mtx, func ){
				var matrix = new Matrix( mtx.lines, mtx.columns );

				matrix.matrix = mtx.matrix.map( ( arr, i ) =>{
					return arr.map( ( num, j ) => {
						return func( num, i, j );
					} )
				} )

				return matrix;

			}

			static ArrayToMatrix( arr ){
				var matrix = new Matrix( arr.length, 1 );
				
				matrix.matrix = matrix.matrix.map( ( e, i ) =>{
					return [arr[i]];
				});
				return matrix;
			}

			static MatrixToArray( obj ){

				var k = [];
				var arr = obj.matrix.map( ( arr, i ) => {
					arr.map( ( elm, j ) => {
						k.push( elm );
					} )
				} )

				return k;

			}

		}

		class Init{
			constructor( rangeInput, rangeHidden={0: 5}, rangeOutput ){

				this.Input = {
					length: rangeInput,
					values: new Matrix( rangeInput, 1 )
				};

				var lengthOfRH = Object.keys(rangeHidden).length;

				this.Hidden = {};
				this.Hidden.length = lengthOfRH;
				this.Hidden.last = this.Hidden.length-1;
				for ( var t = 0; t < lengthOfRH; t++ ){

					this.Hidden[t] = {
						length: rangeHidden[t],
						values: new Matrix( rangeHidden[t], 1 )
					}

				}

				this.Output = {
					length: rangeOutput,
					values: new Matrix( rangeOutput, 1 )
				};

				this.Weights = {
					I_H: new Weight( this.Input, this.Hidden[0] ),
					AMG_H: new Array( lengthOfRH ),
					H_O: new Weight( this.Hidden[this.Hidden.last], this.Output )
				};

				for ( var a = 0; a < this.Hidden.last; a++ ){
					this.Weights.AMG_H[a] = new Weight( this.Hidden[a], this.Hidden[a+1] );
				}

				this.Bias = [
					[new Matrix( this.Hidden[0].length, 1 )],
					[],
					[new Matrix( rangeOutput, 1 )]
				];

				for ( var a = 0; a < this.Hidden.last; a++ ){
					this.Bias[1][a] = new Array();
					this.Bias[1][a] = new Matrix( this.Hidden[a+1].length, 1 );
					
				}

				this.addBiasValues();
				//console.log( this.Bias[1][0] );
			}

			updateOutputSize( range ){

				let lastOutlength = this.Output.length;
				this.Output = {
					length: range,
					values: new Matrix( range, 1 )
				};
				let add = this.Output.length - lastOutlength;
				console.log( this.Output.values );

				let arr = new Weight( this.Hidden[this.Hidden.last].length, add );

				for ( var g = 0; g < add; g++ ){
					this.Weights.H_O.matrix.push( arr.matrix[g] );
				}
				
				this.Weights.H_O.lines += add;

				this.Bias[2][0] = new Matrix( range, 1 );
				this.addBiasValues();

			}

			addBiasValues(){

				for ( var a = 0; a < this.Bias.length; a++ ){

					for ( var b = 0; b < this.Bias[a].length; b++ ){

						for ( var c = 0; c < this.Bias[a][b].lines; c++ ){

							for ( var d = 0; d < this.Bias[a][b].columns; d++ ){

								this.Bias[a][b].matrix[c][d] = Math.random()*2 - 1;

							}

						}
					}

				}

			}

			setInput( values ){

				//Envelopando...
				var a = values.map( function ( e ){

					return [ e ];

				})

				this.Input.values.matrix = a;

			}

		}

		function Randomize ( min, max=null ){

			if ( max == null ){ return Math.floor( Math.random( ) * ( min + 1 ) ); }
			else { return min + Math.floor( Math.random() * ( max - min ) + 1 ); }

		}


		function Weight ( lay1, lay2 ){

			var l1, l2;
			if ( typeof lay1 == "object" ){
				l1 = lay1.values.lines;
				l2 = lay2.values.lines;
			}else{
				l1 = lay1;
				l2 = lay2;
			}
			

			var weight = new Matrix ( l2, l1 );

			for ( var i = 0; i < weight.lines; i++ ){

				for ( var ii = 0; ii < weight.columns; ii++ ){

					weight.matrix[ i ][ ii ] = Math.random()*2 - 1;

				}

			}

			return weight;

			//Cada Linha do Weight corresponde ao index do neurônio resultante, os elementos dentro da linha são os valores que o resultante recebe; 
			//Cada Coluna do Weight corresponde ao index do neurônio inicial, os lemenetos dentro da linha são todos os weights que serão multiplicados;

		}		

		function FeedForwards ( brain ){

			var input = brain.Input;
			var hidden = brain.Hidden;
			var output = brain.Output;
			var bias = brain.Bias;

			//iho

			var weights = {
				ih: brain.Weights.I_H,
				amgh: brain.Weights.AMG_H,
				ho: brain.Weights.H_O
			}

			//Pesos entre Input & Hidden1 -> Hidden[0]
			hidden[0].values = Matrix.Multiply( weights.ih, input.values );

			//Inserindo Bias no Input & aplicando a "sigmoid Function"
			hidden[0].values = Matrix.Add( hidden[0].values, bias[0][0] );
			hidden[0].values = Matrix.map( hidden[0].values, sigmoid );

/*
			//Pesos etre Input e & Hidden1
			hidden.values = Matrix.Multiply( weights.ih, input.values );

			//Inserindo Bias
			hidden.values = Matrix.Add( hidden.values, brain.Bias[0] );
			hidden.values = Matrix.map( hidden.values, sigmoid );
*/

			//Multiplicação de pesos entre as camadas de Hidden
			if ( weights.amgh.length != 1 ){

				for ( var h = 1; h < weights.amgh.length; h++ ){
					//console.log(hidden[h]);
					
					hidden[h].values = Matrix.Multiply( weights.amgh[h-1], hidden[h-1].values );

					hidden[h].values = Matrix.Add( hidden[h].values, bias[1][h-1] );
					hidden[h].values = Matrix.map( hidden[h].values, sigmoid );

				}

			}

			//Output

			output.values = Matrix.Multiply( weights.ho, hidden[hidden.last].values );
			//Inserindo Bias

			output.values = Matrix.Add( output.values, bias[2][0] );
			output.values = Matrix.map( output.values, sigmoid );

			//Getting Result

			this.input = input;
			this.hidden = hidden;
			this.output = output;
			this.weights = weights;
			this.bias = bias;
		}

		function BackPropagation( feed, expected ){

			var MSE = 0;

			var input = feed.input;
			var output = feed.output;
			var hidden = feed.hidden;
			var weightsHO = feed.weights.ho;
			var weightsAMG = feed.weights.amgh;
			var weightsIH = feed.weights.ih;

			var bias = feed.bias;

			var outputErrors = new Matrix( output.values.lines, output.values.columns );
			var hiddenErrors = new Matrix( weightsHO.columns, weightsHO.lines );
			var expected = Matrix.ArrayToMatrix(expected);

			outputErrors = Matrix.Subtract( expected, output.values );

			//D_sigmoid - output
			var d_output = Matrix.map( output.values, dsigmoid );

			// Output --→ Hidden
			var transHidden = Matrix.Transpose( hidden[hidden.last].values );
			var DeltaW_ho = Matrix.Hadamard( outputErrors, d_output );
			

			DeltaW_ho = Matrix.ScalarMatrix( DeltaW_ho, Learning_Rate );

			//adjust Bias
			bias[2][0] = Matrix.Add( bias[2][0], DeltaW_ho )

			DeltaW_ho = Matrix.Multiply( DeltaW_ho, transHidden );
			weightsHO = Matrix.Add( weightsHO, DeltaW_ho );

			var transWeight = Matrix.Transpose( weightsHO );
			hiddenErrors = Matrix.Multiply( transWeight, outputErrors );

			//console.log( outputErrors );

			
			// Among Hiddens
			var ErrorsHidden = [];
			ErrorsHidden.push( hiddenErrors );

			if ( weightsAMG.length != 1 ){

				for ( var h = weightsAMG.length-2; h >= 0; h-- ){

					let lastHiddenErrors = ErrorsHidden[0];

					let d_lastHidden = Matrix.map( hidden[h+1].values, dsigmoid );
					
					let transH = Matrix.Transpose( hidden[h].values );
					let DeltaW_H21 = Matrix.Hadamard( lastHiddenErrors, d_lastHidden );
					DeltaW_H21 = Matrix.ScalarMatrix( DeltaW_H21, Learning_Rate );

					//Adjust Bias
					bias[1][h] = Matrix.Add( bias[1][h], DeltaW_H21 );

					DeltaW_H21 = Matrix.Multiply( DeltaW_H21, transH );
					weightsAMG[h] = Matrix.Add( weightsAMG[h], DeltaW_H21 );

					
					let transWeightH = Matrix.Transpose( weightsAMG[h] );
					thisHiddenErrors = Matrix.Multiply( transWeightH, ErrorsHidden[0] );

					//console.log( thisHiddenErrors );

					ErrorsHidden.splice( 0, 0, thisHiddenErrors );
					
					
				}
				
			}

			//D_sigmoid - hidden
			var d_hidden = Matrix.map( hidden[0].values, dsigmoid );

			var transInput = Matrix.Transpose( input.values );
			var DeltaW_ih = Matrix.Hadamard( ErrorsHidden[0], d_hidden );
			DeltaW_ih = Matrix.ScalarMatrix( DeltaW_ih, Learning_Rate );

			//Adjust Bias
			bias[0][0] = Matrix.Add( bias[0][0], DeltaW_ih );

			DeltaW_ih = Matrix.Multiply( DeltaW_ih, transInput );
			weightsIH = Matrix.Add( weightsIH, DeltaW_ih );

			this.D_Output = d_output;
			this.hiddenErrors = hiddenErrors;
			this.outputErrors = outputErrors;
			this.Input = feed.input;
			this.Weights = {
				I_H: weightsIH,
				AMG_H: new Array(feed.hidden.length),
				H_O: weightsHO
			};
			for ( var a = 0; a < feed.hidden.last; a++ ){
				this.Weights.AMG_H[a] = weightsAMG[a];
			}
			this.Bias = [
				[bias[0][0]],
				[],
				[bias[2][0]]
			];
			for ( var a = 0; a < feed.hidden.last; a++ ){
				this.Bias[1][a] = bias[1][a];
			}

			this.MSE = MSE;
			this.expected = expected;

		}

		function Predict( input, brain ){

			brain.setInput( input );
			var Prediction = new FeedForwards( brain );
			Prediction.output = Matrix.MatrixToArray( Prediction.output.values );

			let index = 0;let mayor = 0; let order = [];
			for ( var i = 0; i < Prediction.output.length; i++ ){
				if ( Prediction.output[i] > mayor ){
					
					index = i;
					mayor = Prediction.output[i];

				}

				if ( order.length == 0 ){

					order.push( Prediction.output[i] );
					
				}else {

					let pushed = false;
					for ( var t = 0; t < order.length; t++ ){
						if ( Prediction.output[i] > order[t] ){
							order.splice( t, 0, Prediction.output[i] );
							pushed = true;
							break;
						}
					}

					if ( !pushed ){
						order.push( Prediction.output[i] );
					}

				}
			}
			var obj = {
				Outputs: Prediction.output,
				ChosenNeuron: index,
				Order: order,
				First: { neuron: Prediction.output.indexOf(order[0]), value: order[0] },
				getNeuronFromOrder: function ( x ){
					return Prediction.output.indexOf( order[ x ] );
				},
				Input: input
			}

			if ( order[1] != undefined ){
				obj.Second = { neuron: Prediction.output.indexOf(order[1]), value: order[1] };
			}
			if ( order[2] != undefined ){
				obj.Third = { neuron: Prediction.output.indexOf(order[2]), value: order[2] };
			}

			return obj;

		}

		function StartNeurons( input, expected, brain ){

			brain.setInput( input );
			var Initiation = new FeedForwards( brain );
			var response = new BackPropagation( Initiation, expected );

			brain.Weights = response.Weights;
			brain.Bias = response.Bias;

		}

		function sigmoid ( x ){
			return  1 / ( 1 + Math.exp( -x ) );
		}
		function dsigmoid( x ){
			return x * ( 1 - x );
		}
		function Data( input, output ){

			this.input = input;
			this.output = output;

		}

		exports.Init = Init;
		exports.Weight = Weight;
		exports.FeedForwards = FeedForwards;	
		exports.BackPropagation = BackPropagation;
		exports.Randomize = Randomize;
		exports.sigmoid = sigmoid;
		exports.Matrix = Matrix;
		exports.Learning_Rate = Learning_Rate;
		exports.StartNeurons = StartNeurons;
		exports.Predict = Predict;
		exports.Data = Data;

	})
)