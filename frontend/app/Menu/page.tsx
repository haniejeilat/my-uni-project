export default function Menu({ pausevalue, onContinue }: { pausevalue: boolean; onContinue?: () => void }){
const menulist = ["continue" , "options" , "save" , "leave"];
return (
<div id = "menu-container" style = {{display : pausevalue ? 'flex': 'none'}}>
    {
        menulist.map((text , i) =>{
            return  <button key = {i} id = {`menubtn-${i}`} 
           onClick={(e) => {
            e.stopPropagation(); 
            if (text === 'continue') {
              onContinue?.();   
            }
            if(text === 'leave'){
            window.location.href = '/';
            }
            }}
            
            >{text}</button>
        })
    }
</div>
);
}