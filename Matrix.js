class Matrix{
    constructor( rows=new Number(1), columns=new Number(1), fill=0, pattern=false ){
        this.rows = rows.valueOf();
        this.cols = columns.valueOf();

        if ( pattern ){ this.fillMatrix( pattern, false ) }
        else{ this.fillMatrix( false, fill ); }
    }

    show(){ console.table(this.value) }

    fillMatrix( pattern, fill ){
        let mx = new Array(this.rows);
        let iFill = 0;

        for ( var i = 0; i < this.rows; i++ ){
            mx[i] = new Array(this.cols);
            for ( var j = 0; j < this.cols; j++ ){
                if ( pattern ){
                    mx[i][j] = pattern(i*this.cols+j);
                }else{
                    if ( typeof fill == 'number' ){
                        mx[i][j] = Number(fill);
                    }else{
                        mx[i][j] = fill[iFill];
                        iFill++;
                    }
                    
                }
            }
        }
        this.value = mx;
    }

    getRow( x ){ if ( x > this.rows-1 ){ throw "Unexistent index at Matrix" } return this.value[x]; }
    getCol( x ){ 
        if ( x > this.cols-1 ){ throw "Unexistent index at Matrix" }
        for ( var a = 0,v=[]; a < this.rows; a++ ){
            for ( var b = 0; b < this.cols; b++ ){
                if ( b == x ){ v.push( this.value[a][b] ); }
            }
        }
        return v;
    }

    setRow( i, values ){ this.value[i] = values; }
    setCol( i, values ){
        for ( var a = 0; a < this.rows; a++ ){
            for ( var b = 0; b < this.cols; b++ ){
                if ( b == i ){ this.value[a][b] = values[a] }
            }
        }
    }

    parseValues( pattern=false, fill=false ){

        let mtx = new Matrix( this.rows, this.cols );
        let p = [];
        for ( var a = 0; a < this.rows; a++ ){
            for ( var b = 0; b < this.cols; b++ ){
                p.push( this.getRow(a)[b] );
            }
        }

        if ( !pattern && !fill ){
            mtx.fillMatrix( false, p );
        }else {
            mtx.fillMatrix( pattern, fill );
        }
        
        return mtx;
        
    }

    static fill( mtx, pattern ){
        
        let values = new Matrix( mtx.rows, mtx.cols );
        mtx.value.forEach( ( e, i ) => { e.forEach( ( e1, i1 ) => { values.value[i][i1] = pattern(e1); } ) } );

        return values;

    }

    static Somatory( a, b, exp ){
        let sum = 0;
        for ( var i = a; i <= b; i++ ){ sum += exp( i ); }
        return sum;
    }

    static Sum( mtx1, mtx2 ){
        try{
            if (mtx1.rows != mtx2.rows && mtx1.cols != mtx2.cols){ throw "\"mtx1\" e \"mtx2\" são matrizes de dimensões diferentes"}

            let arrSum = new Matrix( mtx1.rows, mtx1.cols );
            for ( let i = 0; i < mtx1.rows; i++ ){
                for ( let j = 0; j < mtx1.cols; j++ ){
                    arrSum.value[i][j] = mtx1.value[i][j] + mtx2.value[i][j];
                }
            }

            return arrSum;
        }catch(e){
            console.error(e);
        }
    }

    static Sub( mtx1, mtx2 ){
        try{
            if (mtx1.rows != mtx2.rows && mtx1.cols != mtx2.cols){ throw "\"mtx1\" e \"mtx2\" são matrizes de dimensões diferentes"}

            let arrSub = new Matrix( mtx1.rows, mtx1.cols );
            for ( let i = 0; i < mtx1.rows; i++ ){
                for ( let j = 0; j < mtx1.cols; j++ ){
                    arrSub.value[i][j] = mtx1.value[i][j] - mtx2.value[i][j];
                }
            }

            return arrSub;
        }catch(e){
            console.error(e);
        }
    }
    
    static Multiply( mtx1, mtx2 ){

        try{
            if ( mtx1.cols != mtx2.rows ){ throw "\"mtx1\" e \"mtx2\" são matrizes de dimensões diferentes"}

            let arrRes = new Matrix( mtx1.rows, mtx2.cols );
            for ( var i in mtx1.value ){//rows quantity relationed to mtx1
                for ( var j in mtx2.value[0] ){//cols quantity relationed to mtx1
                    arrRes.value[i][j] = Matrix.Somatory( 0, mtx1.cols-1, 
                        function( p ){ return mtx1.value[i][p] * mtx2.value[p][j]; }
                    )
                }
            }            
            return arrRes;

        }catch(e){
            console.error(e);
        }

    }

    static Hadamard( mtx1, mtx2 ){

        try{
            if (mtx1.rows != mtx2.rows && mtx1.cols != mtx2.cols){ throw "\"mtx1\" e \"mtx2\" são matrizes de dimensões diferentes"}

            let arrHad = new Matrix( mtx1.rows, mtx1.cols );
            for ( let i = 0; i < mtx1.rows; i++ ){
                for ( let j = 0; j < mtx1.cols; j++ ){
                    arrHad.value[i][j] = mtx1.value[i][j] * mtx2.value[i][j];
                }
            }

            return arrHad;
        }catch(e){
            console.error(e);
        }

    }

    static Scalar( sc, mtx ){

        try{
            if ( typeof sc != "number" ){ throw "primeiro parâmetro deve ser um escalar, número real" }

            let M = mtx.parseValues();
            for ( var a = 0; a < mtx.rows; a++ ){
                for ( var b = 0; b < mtx.cols; b++ ){
                    M.value[a][b] *= sc;
                }
            }
            return M;

        }catch(e){
            console.error(e);
        }

    }

    static Transpose( mtx ){

        let mtx2 = new Matrix( mtx.cols, mtx.rows );    let c = 0;
        for ( var i of mtx.value ){//i = each line of mtx
            mtx2.setCol( c, i );    c++;
        }

        return mtx2;

    }

    static arrToMatrix( arr ){

        let mtx = new Matrix( arr.length, 1 );
        mtx.setCol( 0, arr );
        return mtx;

    }

}

export { Matrix }