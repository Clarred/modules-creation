
const ownself = '/ownself/'

function Replace( a, b, c ){

    let newT = [];
    for ( var i = 0; i < c.length; i++ ){
        if ( c[i] == a ){ newT.push(b); }
        else{newT.push(c[i]);}
    }

    return newT.join('');
}

function* Gen( x ){ yield x; while(true){ yield ++x; } }


class Props{
    constructor( duration=1000, iteration=1, playbackdirection='linear', fill='forwards', delay=0 ){
        this.duration = duration;
        this.iteration = iteration;
        this.PlaybackDirection = playbackdirection
        this.fill = fill;
        if ( delay != 0 ){ this.delay = delay; }
    }
}

class TagElement{
    #_evGen
    constructor( x ){
        if ( x == "body" ){ this.node = document.body; }
        else{this.node = document.createElement(x);}

        this.node.classProperties = this;
    
        this.#_evGen = Gen(0);
        this._evCur = 0;
        this.events = [];

        this.animation = new class Animation{
            constructor(steps=false, props=false){
                this.steps = steps;
                this.props = props;
            }
            _setSteps(...st){
                let stp = [];
                this.steps = [];
                try{
                    for ( var a = 0; a < st.length; a++ ){
                        stp.push(st[a]);
                    }
                    if (stp.length == 1){ this.steps = stp[0]; }
                    else{ this.steps = stp }
                }catch(e){
                    console.error(e);
                }

            }
            _setProps( duration=1000, iteration=1, playbackdirection='linear', fill='forwards', delay=0 ){
                this.props = {};
                if ( typeof duration == "object" ){
                    this.props = duration;
                }else{
                    this.props.duration = duration;
                    this.props.iteration = iteration;
                    this.props.PlaybackDirection = playbackdirection;
                    this.props.fill = fill;
                    this.props.delay = delay;
                }
            }
        }
    }

    get id(){ return this.node.id; }
    set id(x){ this.node.id = x; }
    get class(){ return this.node.classList; }
    set class(x){ return this.node.classList.add(x); }
    get text(){ return this.node.textContent; }
    set text(x){ this.node.textContent = x; }
    get HTMLtext(){ return this.node.innerHTML; }
    set HTMLtext(x){ this.node.innerHTML = x; }
    get style(){ return this.node.style; }

    get children(){ return this.node.children; }
    get value(){ return this.node.value; }
    set value(x){ this.node.value = x; }

    newEvent( data, type, name=false ){

        this._evCur = this.#_evGen.next().value;

        class TagEvent{
            constructor( data, type, name='' ){
                this.name = name;
                this.action = data;
                this.type = type;
            }
        }
        let ev = {};
        if ( name ){ ev = new TagEvent( data, type, name ) }
        else{ ev = new TagEvent( data, type, `$${type[0].toUpperCase()+type[1].substr(1)}Event${this._evCur}` ) }

        this.events.push( ev );
        return ev;
    }

    popEvent( obj ){

        let popedEv = new Function();
        let o = 0;
        for ( var e of this.events ){
            if ( obj.name != undefined ){
                if ( e.name == obj.name ){ popedEv=this.events[o]; this.events.splice( o, 1 ); break; }
            }else if ( obj.data != undefined ){
                if ( e.action == obj.data ){ popedEv=this.events[o]; this.events.splice( o, 1 ); break; }
            }
            o++;
        }

        return popedEv;

    }

    Style(obj){
        var k = Object.keys( obj );
        var v = Object.values( obj );
        for ( var a = 0; a < k.length; a++ ){
            this.node.style[k[a]] = v[a];
        }
    }

    animate( animationSteps=this.animation.steps, animationProps=this.animation.props ){
        if ( animationProps == ownself ){ animationProps = this.animation.props }
        if ( animationSteps == ownself ){ animationSteps = this.animation.steps }

        switch ( animationSteps==false || animationProps==false ){
            case false: 
                this.node.animate(animationSteps, animationProps);
                break;
            case true:
                console.error("DeclarationError: There is a non-declarated animation on animate statement");
                break;
        }
    }

    attach( p ){ 
        this.parent = p; 
        if ( this.parent.node ){ this.parent.node.append(this.node); }else{ this.parent.append(this.node); }
         }
    attachBefore( n ){
        let parent = n.parentElement;
        parent.insertBefore( n, this.node );
    }

    dettach( ){
        this.node.remove();
    }

    addAttr( attr, value ){
        this.node.setAttribute(attr, value);
        return this.node;
    }

    addEvent( callback, funct, name=false ){
        this.node.addEventListener( callback, funct );
        this.newEvent( funct, name, callback );
    }
    removeEvent( callback, funct ){
        this.popEvent( {data:funct} );
        this.node.removeEventListener( callback, funct );
    }

    delete(){
        this.node.remove();
    }

    static fromId( x ){ return document.getElementById( x ); }
    static fromClass( x ){ return document.getElementsByClassName( x ); }
    static fromTag( x ){ return document.getElementsByTagName( x ); }
    static queryThis( x ){ return document.querySelector( x ); }
    static queryAll( x ){ return document.querySelectorAll( x ); }
    static hasThisId( x ){ return TagElement.fromId(x) != undefined }

    fromId( x ){ return this.node.getElementById( x ); }
    fromClass( x ){ return this.node.getElementsByClassName( x ); }
    fromTag( x ){ return this.node.getElementsByTagName( x ); }
    queryThis( x ){ return this.node.querySelector( x ); }
    queryAll( x ){ return this.node.querySelectorAll( x ); }
    hasThisId( x ){ return this.fromId(x) != undefined }

    static classStyle( className, objStyle ){
        let keys = Object.keys(objStyle);
        for ( var a = 0; a < Object.keys(objStyle).length; a++ ){
            if ( !( keys[a].toLowerCase() == keys[a]) ){
                let newK = [];
                for ( var b = 0; b < keys[a].length; b++ ){
                    if ( keys[a][b].toUpperCase() == keys[a][b] ){
                        newK.push( '-'+keys[a][b].toLowerCase() );
                    }else{
                        newK.push( keys[a][b] );
                    }
                }
                objStyle[newK.join('')] = objStyle[ keys[a] ];
                delete objStyle[ keys[a] ];
            }
        }
        let p = JSON.stringify(objStyle);
        p = p.split('"');
        p = p.join('');
        p = Replace(',',';',p);

        p = p.split('');
        p.splice(p.length-1,0,';');
        p = p.join('');

        let css = [p];

        let comp = undefined;
        let style;
        style = TagElement.queryThis('style');
        if ( style == undefined || style == null ){ style = new TagElement('style'); }
        else{
            comp = style.innerHTML;
        }

        style.attach( document.head );
        css.splice(0,0,`.${className}`);

        if ( comp != undefined ){ css.splice(0,0,comp); }

        style.HTMLtext = css.join('');

    }
    
}
const Body = new TagElement('body');



export { TagElement, Body, Replace, Props, ownself};