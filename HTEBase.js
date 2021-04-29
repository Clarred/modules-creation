//§ -> caractere nulo;

const AcceptedChars = '\§abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ãâáàêéèîíìôõòóûúùçÃÂÁÀÊÉÈÎÍÌÔÕÒÓÛÚÙÇ!?+-*/()[]{}<>=@#$%&_^~.,:;\n\"\'\\ ';
const TOTAL = AcceptedChars.length;
const Init = TOTAL * 3;

let base = [];
let allow = false;

let c = 1;
for ( var a = 0; a < TOTAL; a++ ){
    for ( var b = 0; b < TOTAL; b++ ){
        base.push( String.fromCharCode(Init + c) );
        c++;
    }
}

function getByChar(x){ return AcceptedChars.indexOf(x) != -1 ? AcceptedChars.indexOf(x) : false; }
function getByIndex(i){ return i >= TOTAL ? false : AcceptedChars[i]; }
function parseDirectly( value ){   
    let group = ( getByChar(value[0]) * TOTAL ) + ( getByChar(value[1]) + 1 );
    group = Init + group;
    return String.fromCharCode( group );
}
function convertSingle( value ){
    let a = value.split(''); a.push('\§');
    return a;
}

function toHTEBase( input ){
    for ( var a = 0; a < input.length; a+=3 ){
        let s = input.split('');    s.splice(a,0,'|');
        s = s.join('');             input = s;
    }

    input = input.split('|');
    input.shift();

    let enc = [];
    for ( var a = 0; a < input.length; a++ ){
        switch (input[a].length){
            case 2:
                enc.push(parseDirectly(input[a]));
                break;
            case 1:
                let newEnc = convertSingle(input[a]); 
                enc.push(parseDirectly(newEnc));
                break;
        }
    }

    return enc.join('');
}

function fromHTEBase( input ){
    let v = input.split('');
    let tsl = [];
    for ( var a = 0; a < v.length; a++ ){
        let times = Math.floor( ( v[a].charCodeAt(0) - Init ) / TOTAL ) ;
        let leftOver = ( v[a].charCodeAt(0) - Init ) % TOTAL ;
        if (leftOver == 0){ times--; leftOver += TOTAL; }

        let letters = [
            getByIndex(times), getByIndex(leftOver-1)
        ];
        for( var b = 0; b < letters.length; b++ ){
            if ( letters[b] == "\§" ){ letters.splice(b,1,'') }
        }

        tsl.push( letters[0] + letters[1] );
    }
    return tsl.join('');
}



export { fromHTEBase, toHTEBase, AcceptedChars };