/**
 * Collision { 'module version' }
 * version: v1.0
 */
const Nol = "Not on line";

function lineFunction( v1, v2 ){
    let A = (v1.y - v2.y)/(v1.x - v2.x);
    let B = (v1.x*v2.y - v2.x*v1.y)/(v1.x-v2.x);

    let Δy = ( v2.x - v1.x ) == 0;
    if ( Δy ){ return new Function( ' x ', `if (x == ${v2.x}){return Infinity;}else{return '${Nol}';}` ); }
    else{ return new Function( ' x ', `return ${A} * x + ${B};` ); }
}

class Break{
    constructor( min, max ){
        this.min = min;
        this.max = max;
    }
    isOnBreak( num ){ return ( num <= this.max ) && ( num >= this.min ); }
}

class BuildPolygon{
    constructor( ...vertices ){

        if ( vertices[0].__proto__.constructor.name == "Coord" ){
            this.vertex = vertices;
        }else{
            this.vertex = vertices[0];
        }

        this.sides = Number();

        this.sides = this.vertex.length;

        this.lines = Array(this.sides);
        this.segmentsLaw = Array(this.sides);

        this.__proto__.iterator = this;

        this.addSegmentsLaw();

        this.getExtremeVertex();
        this.createLines();

    }

    createLines(){
        for ( var a = 0; a < this.sides; a++ ){
            const index = a;
            let next = index+1;
            if ( index + 1 == this.vertex.length ){ next = 0; }

            class Line{
                constructor( v1, v2 ){
                    this.v0 = v1;
                    this.v1 = v2;
                    this.getLimits();
                    this.getIntervals();
                }
                getLimits(){
                    let extX = getExtremes( [this.v0.x, this.v1.x] );
                    let extY = getExtremes( [this.v0.y, this.v1.y] );

                    this.min = {x:extX.min,y:extY.min};
                    this.max = {x:extX.max,y:extY.max};
                }

                getIntervals(){
                    this.breakX = new Break( this.min.x, this.max.x );
                    this.breakY = new Break( this.min.y, this.max.y );
                }
            }

            this.lines[index] = new Line( this.vertex[index], this.vertex[next] );
        }
    }

    getExtremeVertex(){
        let min = {x:this.vertex[0].x,y:this.vertex[0].y};
        let max = {x:this.vertex[0].x,y:this.vertex[0].y};

        for ( var v of this.vertex ){
            if ( v.x < min.x ){ min.x = v.x; }  if ( v.x > max.x ){ max.x = v.x; }
            if ( v.y < min.y ){ min.y = v.y; }  if ( v.y > max.y ){ max.y = v.y; }
        }

        this.extremes = { min: min, max: max };

    }

    addSegmentsLaw(){
        for ( var a = 0; a < this.sides; a++ ){
            const index = a;
            let next = index+1;
            if ( index + 1 == this.vertex.length ){ next = 0; }

            this.segmentsLaw[a] = lineFunction( this.vertex[index], this.vertex[next] ); 
        }
    }

    static pointOnPolygon( polygon, point ){
        let breakNums = [];
        for ( var a = 0; a < polygon.segmentsLaw.length; a++ ){
            let Y = polygon.segmentsLaw[a]( point.x );
            if ( typeof Y == 'number' && Y != Infinity ){

                let Xbreaks = polygon.lines[a].breakX;

                if ( Xbreaks.isOnBreak( point.x ) ){
                    breakNums.push( Y );
                }
                
            }
        }
        let min = getExtremes( breakNums ).min;
        let max = getExtremes( breakNums ).max;

        let intervalY = new Break( min, max );
        let intervalX = new Break( polygon.extremes.min.x, polygon.extremes.max.x );
        
        return intervalY.isOnBreak( point.y ) && ( intervalX.isOnBreak( point.x ) );

    }

}

function getExtremes( arr ){
    let min = arr[0];
    let max = arr[0];
    for ( var a of arr ){
        if ( a < min ){ min = a; }
        if ( a > max ){ max = a; }
    }
    return {min:min,max:max}
}


export { lineFunction, BuildPolygon, Nol, Break}
