/**
 * @MODULE_NAME Doodle.js
 * @version v2.1.1
 */

export { 
    Doodle, Rect, Circle, Line, QuadraticCurve, BezierCurve, SimpleRect,
    Picture, PlainText, Group, Utils, addPendingFunction, Coordinate, Size, 
    WipeCircle, WipeRect, Gradient, Rgb, exportAsVars
}

const MAIN_COLOR = "#000000";
const PI = Math.PI;

class Coordinate{
    #_x; #_y;
    constructor( x, y ){ this.#_x = x, this.#_y = y; }
    get x(){ return this.#_x; } set x( n ){ this.#_x = n; this.onXchange(); }
    get y(){ return this.#_y; } set y( n ){ this.#_y = n; this.onYchange(); }

    onXchange(){}   onYchange(){}   onPositionChange(){}
    set( x, y ){ this.x = x, this.y = y; this.onPositionChange(); }
    pass(){ return new Coordinate( this.x, this.y ); }
    copy( coord ){ this.x = coord.x, this.y = coord.y }
    subtract( coord ){ return new Coordinate( this.x - coord.x, this.y - coord.y ); }
    add( coord ){ return new Coordinate( this.x + coord.x, this.y + coord.y ); }
}

class Size{
    #_width; #_height;
    constructor( w, h ){ this.#_width = w, this.#_height = h; }
    get width() { return this.#_width; } set width( _w ) { this.#_width = _w;  }
    get height() { return this.#_height; } set height( _h ) { this.#_height = _h; }

    widthChange( ){} heightChange( ){} sizeChange(  ){}
    set( w, h ){ this.width = w, this.height = h;  }
    pass() { return new Size( this.width, this.height ); }
    copy( size ){ this.width = size.width, this.height = size.height; }
}

class SimpleRect{
    constructor( x, y, w, h ){
        this.position = new Coordinate( x, y );
        this.size = new Size( w, h );
    }
}

class SimpleCircle{
    constructor( x, y, r ){
        this.position = new Coordinate( x, y );
        this.size = { r: r };
    }
}

class Gradient{
	constructor( color, widthRange ){
		this.color = color;
		this.widthRange = widthRange;
	}
}

class Rgb{
    constructor( r, g, b ){
        this.Red = r;
        this.Green = g;
        this.Blue = b;
    }
    get rgb(){ return `rgb(${this.Red},${this.Green},${this.Blue})`;}
}

class Object2D{
    #istranslated; #angle; #styles
    constructor( x, y ){
        this.position = new Coordinate( x, y );
        this.translated = new Coordinate( 0, 0 );
        this.size = new Size( 0, 0 );

        this.originDistance = new Coordinate( x, y );
        
        this.#istranslated = false;

        this.opacity = 1;

        this.style = {
            strokeColor: MAIN_COLOR,
            fillColor: MAIN_COLOR,
            strokeWidth: 2,
            strokeCap: "butt",
            strokeJoin: "miter",
            isStroke: false,
            isFill: true,
            shadow: {
                color: "#000",
                blur: 0,
                axisX: 0,
                axisY: 0,
                hasShadow: false
            },
            gradient: {
                strokeGradient:{},
                fillGradient: {},
                hasFillGradient:false,
                hasStrokeGradient:false,
                relation: 'relative'
            }
        }

        this.#styles = Object.keys(this.style);
    }
    rotate( ang ){
        this.#istranslated = true;
        this.#angle = ang;
    }
    removeRotate( ){
        this.#istranslated = false;
    }

    stylize( obj ){
        let k = Object.keys(obj);
        let v = Object.values(obj);
        try{
            for ( var y = 0; y < k.length; y++ ){ if ( this.#styles.indexOf(k[y]) == -1 )
                { throw `There is no such '${k[y]}' key on ${this.__proto__.constructor.name} class`; }
            }

            for ( var a = 0; a < k.length; a++ ){
                this.style[k[a]] = v[a];
            }
        }catch(e){
            console.error(`Uncaught ReferenceError: ${e}`);
        }
        
    }

    setParent( frame ){ this.parentFrame = frame; }
    setRenderProperties( c ){
        c.lineWidth = this.style.strokeWidth;
        c.lineCap = this.style.strokeCap;
        c.lineJoin = this.style.strokeJoin;

        c.globalAlpha = this.opacity;

        if ( this.style.shadow.hasShadow ){
            c.shadowColor = this.style.shadow.color;
            c.shadowBlur = this.style.shadow.blur;
            c.shadowOffsetX = this.style.shadow.axisX;
            c.shadowOffsetY = this.style.shadow.axisY;
        }
        
        if ( this.style.gradient.hasFillGradient ){
            //c.fillStyle = this.fillGradient;
            let grds = this.style.gradient.fillGradient;
            let grad;
            if ( this.style.gradient.relation == 'relative' ){
                grad = c.createLinearGradient( 
                    this.position.x-this.size.width/2, 
                    this.position.y-this.size.height/2,
                    this.position.x+this.size.width/2, 
                    this.position.y+this.size.height/2 );
            }else{
                grad = c.createLinearGradient( 0, 0, this.parentFrame.width, this.parentFrame.height );
            }

            for ( var a in Array(grds.length).fill({}) ){
                grad.addColorStop( grds[a].widthRange, grds[a].color );
            }
            c.fillStyle = grad;

        }else{
            c.fillStyle = this.style.fillColor;
        }

        if ( this.style.gradient.hasStrokeGradient ){
            //c.fillStyle = this.fillGradient;
            let grds = this.style.gradient.strokeGradient;
            let grad;
            if ( this.style.gradient.relation == "relative" ){
                grad = c.createLinearGradient( 
                    this.position.x-this.size.width/2, 
                    this.position.y-this.size.height/2,
                    this.position.x+this.size.width/2, 
                    this.position.y+this.size.height/2 );
            }else{
                grad = c.createLinearGradient( 0, 0, this.parentFrame.width, this.parentFrame.height );
            }

            for ( var a in Array(grds.length).fill({}) ){
                grad.addColorStop( grds[a].widthRange, grds[a].color );
            }
            c.strokeStyle = grad;

        }else{
            c.strokeStyle = this.style.strokeColor;
        }

    }

    setFillGradient( ...gradients ){
        this.style.gradient.hasFillGradient = true;
        try{
            if ( gradients.length <= 1 ){ throw `At least 2 arguments are required, but ${gradients.length} present.\n` }
            if ( gradients[0].__proto__.constructor.name != "Gradient" ){ throw "All objects must be an instance of Gradient class\n"; }

            this.style.gradient.fillGradient = gradients;

        }catch(e){
            console.error( e, gradients );
        }

    }

    disableFillGradient(){
        this.style.gradient.hasFillGradient = false;
    }

    deleteFillGradient( i=false ){
        if ( i ){ this.style.gradient.fillGradient.splice( i, 1 ); }
        else{ this.style.gradient.fillGradient = {}; }
    }

    setStrokeGradient( ...gradients ){
        this.style.gradient.hasStrokeGradient = true;
        try{
            if ( gradients.length <= 1 ){ throw `At least 2 arguments are required, but ${gradients.length} was present.\n` }
            if ( gradients[0].__proto__.constructor.name != "Gradient" ){ throw "All objects must be an instance of Gradient class\n"; }

            this.style.gradient.strokeGradient = gradients;

        }catch(e){
            console.error( e, gradients );
        }

    }

    disableStrokeGradient(){
        this.style.gradient.hasStrokeGradient = false;
    }

    deleteStrokeGradient( i=false ){
        if ( i ){ this.style.gradient.strokeGradient.splice( i, 1 ); }
        else{ this.style.gradient.strokeGradient = {}; }
        this.style.gradient.disableStrokeGradient();
    }

    setShadow( axisX, axisY, blur, color ){
        this.style.shadow = {
            hasShadow: true,
            color: color,
            blur: blur,
            axisX: axisX,
            axisY: axisY
        };
    }

    resetShadow(  ){
        this.style.shadow = {
            hasShadow: false,
            color: "#000",
            blur: 0,
            axisX: 0,
            axisY: 0
        };
    }

    removeShadow( ){
        this.style.shadow.hasShadow = false;
    }

    get istranslated(){ return this.#istranslated; }
    get angle(){ return this.#angle; }
}

class Stroke extends Object2D{
    #_coords; #_started;
    constructor( ...coords ){
        super( 0, 0 );
        
        if ( coords[0][0].__proto__.constructor.name == "Array" ){
            coords = coords[0][0];
        }else{
            coords = coords[0];
        }
        

        
        try{
            if ( coords.length % 2 == 1 ){ throw "Uncaught RangeError: the number of parameters do not satisfy the instanciated class" }
         
            this.#_coords = coords;
            this.#_started = [];

            this.close = false;
            this.vertices = []; this.distance = [];
            this.originDistance = Array();

            this.#_startPositioning();
            this.#_positionVertices( );
            this.#_distanceVertices( );

            let self = this;
            let change = function(){
                for( var a = 0; a < self.vertices.length; a++ ){
                    self.vertices[a] = self.position.subtract( self.distance[a] );
                }
            }
            this.position.onXchange = change;
            this.position.onYchange = change;
            this.position.onPositionChange = change;

            this.style.isFill = false;
            this.style.isStroke = true;

            this.YFX(); this.XFY();

            this.vertices[0].x = this.vertices[0].x;
            

        }catch( e ){
            console.error( e );
        }
    
    }
    closeLine(){
        this.close = true;
    }

    YFX( ){
        this.Fx = [];
        for ( let v = 0; v < this.vertices.length-1; v++ ){
            if ( v+1 < this.vertices.length){
                let vx = [ this.vertices[v], this.vertices[v+1] ];
                let a = (vx[0].y - vx[1].y)/(vx[0].x - vx[1].x);
                let b = vx[0].y - ( vx[0].x * a );
                let Fx = new Function( 'x' , `return ${a}*x + ${b}` );
                this.Fx.push(Fx);
            }
            
        }
        
    }

    XFY( ){
        this.Fy = [];
        for ( let v = 0; v < this.vertices.length-1; v++ ){
            if ( v+1 < this.vertices.length){
                let vx = [ this.vertices[v], this.vertices[v+1] ];
                let a = (vx[0].y - vx[1].y)/(vx[0].x - vx[1].x);
                let b = vx[0].y - ( vx[0].x * a );
                let Fy = new Function( 'y' , `return (y - ${b})/${a}` );
                this.Fy.push(Fy);
            }
        }
        
    }
    
    #_startPositioning(  ){
        let pos = this.#_getCenterPosition( );
        this.position.set( pos[0], pos[1] );
        if ( !this.#_started[1] ) {
            this.#_started[1] = true;
            this.size.set( pos[2], pos[3] );
        }
    }
    #_startSizing(){
        this.#_started[0] = true;
        let self = this;
        let _changeSizeW = function ( w ){
            let _w = ( w - self.size.width ) / 2;  
            if ( _w != 0 || _w != undefined ){
                for ( var a = 0, step = 0; a < self.vertices.length; a++, step+=2 ){
                    if ( self.vertices[a].x < self.position.x ){ self.vertices[a].x -= _w; }
                    else if ( self.vertices[a].x > self.position.x){ self.vertices[a].x += _w; }
                    self.setCoords( step, self.vertices[a].x );
                }
            }
            self.size.width = w;
            self.#_distanceVertices();
        }
        let _changeSizeH = function ( h ){
            let _h = ( h - self.size.height ) / 2;
            if ( _h != 0 || _h != undefined ){
                for ( var a = 0, step = 1; a < self.vertices.length; a++, step+=2 ){
                    if ( self.vertices[a].y < self.position.y ){ self.vertices[a].y -= _h; }
                    else if ( self.vertices[a].y > self.position.y ){ self.vertices[a].y += _h; }
                    self.setCoords( step, self.vertices[a].y );
                }
            }
            self.size.height = h;
            self.#_distanceVertices();
        }
        let _changeSize = function( w=0, h=0 ){
            _changeSizeH( h );        _changeSizeW( w );
        }
    
        this.size.heightChange = _changeSizeH;
        this.size.widthChange = _changeSizeW;
        this.size.sizeChange = _changeSize;
    }

    #_adjustPosition(){
        this.#_startPositioning();this.#_distanceVertices();
        if ( !this.#_started[0] ) this.#_startSizing();
    }
    /**
     * Cada vertice do objeto recebe sua funçao de mudança e eixo /posição/ e instanciado a patir do parametro coords dado
     */
    #_positionVertices( ){
        let coords = this.#_coords;
        let x = 0;
        for( var a = 0; a < coords.length; a+=2 ){
            this.vertices[x] = ( new Coordinate( coords[a], coords[a+1] ) );
            this.vertices[x].onXchange          = this.#_adjustPosition.bind(this);
            this.vertices[x].onYchange          = this.#_adjustPosition.bind(this);
            this.vertices[x].onPositionchange   = this.#_adjustPosition.bind(this);
            x++;
        }
        for( var a = 0; a < this.vertices.length; a++ ){
            this.originDistance[a] = this.vertices[a].pass();
        }
    }
    #_distanceVertices( ){
        for ( var a = 0; a < this.vertices.length; a++ ){
            this.distance[a] = ( this.position.subtract( this.vertices[a] )  );
        }
    }

    #_getCenterPosition( ){
        let coords = this.#_coords;
        let Mx = coords[0];let mx = coords[0];
        let My = coords[1];let my = coords[1];
        for ( var a = 0; a < coords.length; a++ ){
            if ( a % 2 == 0 ){
                if ( coords[a] > Mx ){Mx = coords[a];}
                else if ( coords[a] < mx ){mx = coords[a];}
            }
            else{
                if ( coords[a] > My ){My = coords[a];}
                else if ( coords[a] < my ){my = coords[a];}
            }
        }
        let Δx = Mx - mx;
        let Δy = My - my;

        return [ mx + (Δx/2) , my + (Δy/2), Δx, Δy ];
    }   

    getCoords(){
        return this.#_coords;
    }
    setCoords( i, v=false ){
        if ( v ) this.#_coords[i] = v;
        else { this.#_coords = i };
    }
    pushToCoords( ...elms ){
        for ( var a = 0; a < elms.length; a++ ){
            this.#_coords.push( elms[a] );
        }
    }

    setVertex( i, coordx, coordy=false ){
        if ( !coordy ){ this.vertices[i] = coordx; }
        else{ this.vertices[i].x = coordx; this.vertices[i].y = coordy; }
    }

    addVertex( x, y ){
        if ( this.__proto__.constructor.name == "Line" ){
            this.pushToCoords( x, y );
            this.#_startPositioning( );
            this.#_positionVertices();
            this.#_distanceVertices();
        }
    }

    wayToBuild( c, self ){
        if ( self.parentFrame ){
            self.setRenderProperties( c );

            let v = self.vertices;
            let d = self.originDistance;

            if ( self.istranslated ){
                c.save();
                c.translate( self.translated.x, self.translated.y );
                c.rotate( self.angle );

                c.moveTo( d[0].x, d[0].y );
                if ( self.typeFunction() == "bezier" ){ c.bezierCurveTo( d[1].x, d[1].y, d[2].x, d[2].y, d[3].x, d[3].y ); }
                else if ( self.typeFunction() == "line" ){ for ( var a = 1; a < d.length; a++ ) c.lineTo( d[a].x, d[a].y ); }
                else if ( self.typeFunction() == "quadratic" ){ c.quadraticCurveTo( d[1].x, d[1].y, d[2].x, d[2].y ); }

                if ( self.close ) c.lineTo( d[0].x, d[0].y );

                c.restore();
            }else{
                c.moveTo( v[0].x, v[0].y );

                if ( self.typeFunction() == "bezier" ){ c.bezierCurveTo( v[1].x, v[1].y, v[2].x, v[2].y, v[3].x, v[3].y ); }
                else if ( self.typeFunction() == "line" ){ for ( var a = 1; a < v.length; a++ ) c.lineTo( v[a].x, v[a].y ); }
                else if ( self.typeFunction() == "quadratic" ){ c.quadraticCurveTo( v[1].x, v[1].y, v[2].x, v[2].y ); }
                
                if ( self.close ) c.lineTo( v[0].x, v[0].y );
            }

            

            if ( self.style.isFill ) c.fill();
            if ( self.style.isStroke ) c.stroke();

        }
    }
}

class Rect extends Object2D {
    constructor( x, y, w, h ){
        super(x, y);
        this.size.set( w, h );
    }
    wayToBuild( c, self ){
        if ( self.parentFrame ){
            var x, y, w, h, tx, ty, odx, ody;
            var style = self.style;
            x = self.position.x;    y = self.position.y;
            w = self.size.width;    h = self.size.height;
            tx = self.translated.x; ty = self.translated.y;
            odx = self.originDistance.x; ody = self.originDistance.y;

            self.setRenderProperties( c );

            if ( self.istranslated ){

                c.save();
                c.translate(tx, ty);
                c.rotate( self.angle );

                if ( style.isFill ) c.fillRect( odx, ody, w, h );
                if ( style.isStroke ) c.strokeRect( odx, ody, w, h );

                c.restore();

            }else{

                if ( style.isFill ) c.fillRect( x-w/2, y-h/2, w, h );
                if ( style.isStroke ) c.strokeRect( x-w/2, y-h/2, w, h );

            }
        }
    }
}

class Circle extends Object2D{
    constructor( x, y, r ){
        super( x, y );
        var self = this;

        this.size.r = r;
        this.size.set = function( _r ){
            self.size.r = _r;
            self.size.width = _r/2;
            self.size.height = _r/2;
        }
    }
    wayToBuild( c, self ){
        if ( self.parentFrame ){
            self.setRenderProperties( c );
            
            if ( self.istranslated ){
                c.save()
                c.translate( self.translated.x, self.translated.y );
                c.rotate( self.angle );

                c.arc( self.originDistance.x, self.originDistance.y, self.size.r, PI*2, 0 );
                c.restore();
            }else{
                c.arc( self.position.x, self.position.y, self.size.r, PI*2, 0 );
            }

            if ( self.style.isFill ) c.fill();
            if ( self.style.isStroke ) c.stroke();
        }
    }
}

class BezierCurve extends Stroke{
    constructor( ...coords ){ super( coords ); }
    typeFunction(){ return 'bezier'; }
}

class Line extends Stroke{
    constructor( ...coords ){ super( coords ); }
    typeFunction(){ return 'line'; }
}

class QuadraticCurve extends Stroke{
    constructor( ...coords ){ super( coords ); }
    typeFunction(){ return 'quadratic'; }
}

class Group{
    #x; #y; #width; #height; #render; #opacity;
    constructor( object ){

        this.type = "Group";
        
        let uni = this.#startclass(object)
        let max = uni.max;let min = uni.min;
    
        this.#width = ( max.x - min.x );
        this.#height = ( max.y - min.y );
        this.#x = min.x + this.width/2;
        this.#y = min.y + this.height/2;

        this.objectconnected = uni.objs;
        this.objectz = object;
        this.distVertex = this.getDist();

        this.#opacity = 1;
        this.#render = true;
    }
    getDist(){
        
        var distObj = [];

        for ( var a = 0; a < this.objectconnected.length; a++ ){
            var x = this.#x - this.objectconnected[a].Props.x;
            var y = this.#y - this.objectconnected[a].Props.y;
            distObj.push( new Coord( x, y ) );
        }

        return distObj;

    }

    copy(){

        var a = {};
        for ( var b = 0; b < this.objectconnected.length; b++ ){
            let o = this.objectconnected[b];
            a[Object.keys(this.objectz)[b]] = new Draws[o.type]( o.export() );
        }
        return new Group( a );
    }

    #startclass( arr ){

        arr = Object.values(arr).map((e)=>{return e});
    
        var min = { x:scene.Cwidth,y:scene.Cheight };
        var max = { x:0,y:0 };
    
        for ( var a = 0; a < arr.length; a++ ){
            if ( arr[a].Props.x-(arr[a].Props.width/2) < min.x ){
                min.x = arr[a].Props.x-(arr[a].Props.width/2);
            }
            if ( arr[a].Props.x+(arr[a].Props.width/2) > max.x ){
                max.x = arr[a].Props.x+(arr[a].Props.width/2);
            }
            if ( arr[a].Props.y-(arr[a].Props.height/2) < min.y ){
                min.y = arr[a].Props.y-(arr[a].Props.height/2);
            }
            if ( arr[a].Props.y+(arr[a].Props.height/2) > max.y ){
                max.y = arr[a].Props.y+(arr[a].Props.height/2);
            }
        }
        return {max:max, min:min, objs: arr};
    }

    #_moveX( x ){
        this.#x = x;
        for ( var a = 0; a < this.distVertex.length; a++ ){
            this.objectconnected[a].Props.x = this.#x - this.distVertex[a].x;
        }
    }

    #_moveY( y ){
        this.#y = y;
        for ( var a = 0; a < this.distVertex.length; a++ ){
            this.objectconnected[a].Props.y = this.#y - this.distVertex[a].y;
        }
    }

    get x(){ return this.#x; }
    get y(){ return this.#y; }
    get width(){ return this.#width; }
    get height(){ return this.#height; }
    get render(){ return this.#render; }
    get opacity(){ return this.#opacity; }

    set x( _x ) { this.#_moveX(_x); }
    set y( _y ) { this.#_moveY(_y); }
    set render( _r=true ){ 
        this.#render = _r;

        for ( var a = 0; a < this.objectconnected.length; a++ ){
            this.objectconnected[a].rendering = _r;
        }
    
    }
    set opacity( o ){
        this.#opacity = o;

        for ( var a = 0; a < this.objectconnected.length; a ++ ){
            this.objectconnected[a].opacity = o;
        }
    }

}

class Picture extends Object2D{
    #state;
    constructor( path, x, y, w=false, h){
        super( x, y );

        delete this.style;
        delete this.stylize;

        if ( w != false ){ this.InitSize = true; this.size.set( w, h ) }
        else{ this.InitSize = false; }

        this.$path = path;
        /**
         * possible states: 
         * normal => just (x, y)
         * sizable => ( x, y, w, h ) [w & h == pre defined]
         * cutable => ( x, y, w, h, Cx, Cy, Cw, Ch ) [ Cn... => related to the cut ]
         */
        this.#state = /normal/;

        this.cutter = {
            position: new Coordinate( 0, 0 ),
            size: new Size( 0, 0 )
        }

        this.source = new Image();
        this.source.src = path;
        this.source.onload = sizeSettings;
        this.source.__selfInstance = this;

        const _self = this;
        function sizeSettings(){
            return new Promise( resolve => {
                resolve( [_self.source.width, _self.source.height] );
            } )
        }
        
        async function Call(){
            let response = (await _self.source.onload());
            if ( !_self.InitSize ){
                _self.size.set( response[0], response[1] );
            }
            let sm = Utils.SmallerInt(response[0], response[1]);
            let hg = Utils.HigherInt(response[0], response[1]);
            _self.ratio = sm / hg;
            _self.degratio = hg / sm;
        }

        Call();

    } 
    async scale( _w, _h ){
        (await this.source.onload());

        this.#state = /sizable/;
        this.size.width = this.size.width * _w; this.size.height = this.size.height * _h;
    }

    async resize( w, h ){
        (await this.source.onload());

        this.#state = /sizable/;
        this.size.width = w; this.size.height = h;
    }

    async cut( cx, cy, cw, ch ){
        (await this.source.onload());

        this.#state = /cutable/;
        this.cutter.position.set( cx, cy );
        this.cutter.size.set( cw, ch );
    }

    //ratio[ 0 < r <= 1 ] -> found a smaller num
    //degratio[ r >= 1 ] -> found a higher num

    /**
     * 
     * @param h the height correspondent to the ratio you want
     * @returns returns the correspondent width, calculated with the ratio
     */
    getWidthRatioSize( h ){
        return new Promise( resolve => {
            var self = this;
            async function waitProcess(){
                ( await self.source.onload() );
                let R = 0;
                let higher = Utils.HigherInt( self.size.width, self.size.height )
                if ( higher == self.size.width ){R = h * self.degratio;
                }else{R = h * self.ratio;}
                resolve(R);
            }
            waitProcess();
        } )
    }
    
    /**
     * 
     * @param w the width correspondent to the ratio you want
     * @returns returns the correspondent height, calculated with the ratio
     */
    getHeightRatioSize( w ){
        return new Promise( resolve => {
            var self = this;
            async function waitProcess(){
                ( await self.source.onload() );
                let R = 0;
                let higher = Utils.HigherInt( self.size.width, self.size.height )
                if ( higher == self.size.height ){R = w * self.degratio;
                }else{R = w * self.ratio;}
                resolve(R);
            }
            waitProcess();
        } )
    }

    /*readyonly*/ 
    get state(){ return this.#state; }


    wayToBuild( c, self ){
        if ( self.parentFrame ){
            
            let P = self.position;
            let S = self.size;
            let Cp = self.cutter.position;
            let Cs = self.cutter.size;

            let T = self.translated;

            try{
                if ( self.istranslated ){
                    c.save();
                    c.translate( P.x, P.y );
                    c.rotate( self.angle );

                    switch( self.state.source ){
                        case "normal":
                            c.drawImage( self.source, T.x-S.width/2, T.y-S.height/2 );
                            break;
                        case "sizable":
                            c.drawImage( self.source, T.x-S.width/2, T.y-S.height/2, S.width, S.height );
                            break;
                        case "cutable":
                            c.drawImage( self.source, Cp.x-Cs.width/2, Cp.y-Cs.height/2, Cs.width, Cs.height, T.y-S.height/2, T.y-S.height/2, S.width, S.height );
                            break;
                        default:
                            throw "Uncaught typeError: the given type is unknown";
                        }

                    c.restore();
                }else{
                    switch( self.state.source ){
                        case "normal":
                            c.drawImage( self.source, P.x-S.width/2, P.y-S.height/2 );
                            break;
                        case "sizable":
                            c.drawImage( self.source, P.x-S.width/2, P.y-S.height/2, S.width, S.height );
                            break;
                        case "cutable":
                            c.drawImage( self.source, Cp.x-Cs.width/2, Cp.y-Cs.height/2, Cs.width, Cs.height, P.y-S.height/2, P.y-S.height/2, S.width, S.height );
                            break;
                        default:
                            throw "Uncaught typeError: the given type is unknown";
                    }
                }
            }catch(e){
                console.error( e );
            }

        }
    }
}

class PlainText extends Object2D{
    constructor( x, y, text, font="30px Arial"){
        super( x, y );
        this.text = text;
        this.font = font;

        this.style.align = "start";
    }
    wayToBuild( c, self ){
        if ( self.parentFrame ){
            c.font = self.font;

            let sz = c.measureText( self.text );
            self.size.set( sz.width, sz.actualBoundingBoxAscent );

            self.setRenderProperties( c );

            let style = self.style;

            c.textAlign = self.style.align;

            if ( style.isFill ){ c.fillText( self.text, self.position.x, self.position.y ); }
            if ( style.isStroke ){ c.strokeText( self.text, self.position.x, self.position.y ); }            
        }
    }
}

class WipeRect extends Object2D{
    constructor( x, y, w, h ){
        super(x, y);
        this.size = new Size( w, h );
    }
    wayToBuild( c, self ){
        if ( self.parentFrame ){

            var x = self.position.x, y = self.position.y, w = self.size.width, h = self.size.height;
            c.clearRect( x-w/2, y-h/2, w, h );

        }
    }
}

class WipeCircle extends Object2D{
    constructor( x, y, r ){
        super(x, y);
        this.size = { r: r }
    }
    wayToBuild( c, self ){
        if ( self.parentFrame ){
            let ang = Utils.DegToRad(0);
            for ( var a = 0; a < 360; a++ ){
                c.save();
                c.translate( self.position.x, self.posittion.y );
                c.rotate( ang );
                
                c.clearRect( 0, 0, self.size.r, 1 );

                c.restore();
                ang += Utils.DegToRad(1);
            }
        }
    }
}

class Doodle{
    #_context; #_width; #_height;
    constructor( width, height, parent=document.body ){

        this.Frame = document.createElement('canvas');
        this.Frame.width = width;
        this.Frame.height = height;
        this.#setWidth( width ); this.#setHeight( height );

        this.Frame.activeDoodle = this;

        this.Frame.onresize = function (){
            this.activeDoodle.setWidth( this.width );
            this.activeDoodle.setheight( this.height );
        }
        this.attachedObjects = [];

        //ms
        this.updateTax = 0;
        this.renderFunction = function(){return 0;};
        this.intervalHandle = null;

        this.#_setContext();
        this._attachTo(parent);

    }
    /**
     * 
     * @param {Number} ms time of render update in miliseconds  
     */
    updateRenderTax( ms=Number() ){
        this.updateTax = ms;
    }

    renderAllComponents(  ){
        try{
            if ( this.intervalHandle == null ){
                if ( this.renderFunction == function(){return 0;} || this.updateTax == 0 ){
                    throw "Necessary to define update tax and/or render function to procced\nRender Function: "+this.renderFunction+"\nUpdate Tax: "+this.updateTax+"ms";
                }else{
                    this.intervalHandle = setInterval( this.renderFunction, this.updateTax );
                }            
            }else{
                throw "Already handling the interval";
            }
        }catch( e ){
            console.error( e );
        }
    }

    _setPath( f, _self ){
        this.#_context.beginPath();
        f( this.#_context, _self );
        this.#_context.closePath();
    }

    getURL(){
        return this.Frame.toDataURL();
    }

    stylize( obj ){
        for ( var a = 0; a < Object.keys(obj).length; a++ ){
            this.Frame.style[Object.keys(obj)[a]] = Object.values(obj)[a];
        }
    }

    WipeFrame(){
        this.getContext().clearRect(0,0,this.#_width, this.#_height);
    }

    Rendering(){
        for ( var a = 0; a < this.attachedObjects.length; a++ ){
            this._setPath( this.attachedObjects[a].wayToBuild, this.attachedObjects[a] );
        }
    }

    addFromObject( object ){
        for ( var obj of Object.values( object ) ){ this.add( obj ); }
    }

    addFromArray( array ){
        for ( var obj of array ){
            this.add( obj );
        }
    }

    WatchFullScreen(){
        this.width = innerWidth;
        this.height = innerHeight;
        this.stylize({'border':'none','position':'absolute','left':0,'top':0})
    }

    add( obj ){
        obj.setParent( this );
        this.attachedObjects.push( obj );
    }
    
    remove( obj ){
        let hasInto = false;
        let atIndex = -1;
        for ( var a = 0; a < this.attachedObjects.length; a++ ){
            if ( this.attachedObjects[a] == obj ){ hasInto = true; atIndex = a; break; }
        }
        if ( hasInto ){ this.attachedObjects.splice( atIndex, 1 ); }
        else{ throw "Not added to the Doodle" }
    }

    removeAll(){
        this.attachedObjects = Array();
    }

    #setWidth ( w ){ this.#_width = w; }
    #setHeight ( h ){ this.#_height = h; }

    getWidth () { return this.#_width; }
    getHeight () { return this.#_height; }

    get width(){ return this.#_width; }
    set width( _w ){ this.#_width = _w; this.Frame.width = _w; }

    get height(){ return this.#_height; }
    set height( _h ){ this.#_height = _h; this.Frame.height = _h }

    viewContainer(){
        this.Frame.style.border = "solid 1px #000";
    }

    _attachTo( parent ){
        this.parent = parent;
        this.parent.appendChild(this.Frame);
    }

    getPixelData( x, y ){
        return this.getContext().getImageData( x, y, 1, 1 );
    }

    setPixelData( data, x, y ){
        if ( data.__proto__.constructor.name == "ImageData" ){
            this.getContext().putImageData( data, x, y );
        }else if( data.__proto__.constructor.name == "Rgb" ){
            let imgD = this.getPixelData(0,0);
            imgD.data[0] = data.Red; 
            imgD.data[1] = data.Green;
            imgD.data[2] = data.Blue;
            imgD.data[3] = 255;
            this.getContext().putImageData( imgD, x, y );
        }
        
    }

    getImageData( x, y, w, h ){
        return this.getContext().getImageData( x, y, w, h );
    }

    setImageData( data, x, y, w, h ){
        if ( data.__proto__.constructor.name == "ImageData" ){
            this.getContext().putImageData( data, x, y, w, h );
        }else if( data.__proto__.constructor.name == "Rgb" ){
            let imgD = this.getPixelData(0,0);
            imgD[0] = data.Red; imgD[1] = data.Green; imgD[2] = data.Blue;
            this.getContext().putImageData( imgD, x, y, w, h );
        }
    }

    #_setContext (){ this.#_context = this.Frame.getContext("2d"); }
    getContext(){ return this.#_context; }

}

function exportAsVars( obj, onexport=function(e){}){

    for ( var a = 0; a < Object.keys(obj).length; a++ ){
        let k = Object.keys(obj)[a];    let v = Object.values(obj)[a];
        window[k] = v;
        onexport( v, a );
    }

}

class Utils{
    static PI = Math.PI;
    static CH = "abcdefghijklmnopqrstuvwxyz0123456789/=ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    static DegToRad( ang ){ return ( Utils.PI * ang ) / 180; }
    static RadToDeg( ang ){ return ( 180 * ang ) / Utils.PI; }
    static SmallerInt( ...int ){ 
        for ( var a = 1, sm=int[0]; a < int.length; a++ ){ if ( int[a] < sm ){ sm = int[a] } }
        return sm;
    }
    static HigherInt( ...int ){ 
        for ( var a = 1, hg=int[0]; a < int.length; a++ ){ if ( int[a] > hg ){ hg = int[a] } }
        return hg;
    }
    static isLowerCase( w ){return w.toLowerCase() == w;}
    static isUpperCase( w ){return w.toUpperCase() == w;}
}
/**
 * 
 * @param  {...function} f is an async function with its awaits inside
 */
function addPendingFunction( ...f ){
    for ( var a = 0; a < f.length; a++ ){f[a]();}
}
