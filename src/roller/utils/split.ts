 export function splitTakingIntoAccountBrackets(s: string): Array<string> {
    let current='';
    let parenthesis=0;
    const results = [];
    for(let i=0, l=s.length; i<l; i++){ 
        if(s[i] == '('){ 
            parenthesis++; 
            current=current+'(';
        }else if(s[i]==')' && parenthesis > 0){ 
            parenthesis--;
            current=current+')';
        }else if(s[i] ===',' && parenthesis == 0){
            results.push(current);
            current=''
        }else{
            current=current+s[i];
        }   
    }
    if(current !== ''){
        results.push(current)
    }
    return results
}
