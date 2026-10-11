'use client'
import { getCurrentWindow } from '@tauri-apps/api/window';
export default function Main(){
   const menulist = ["Play", "Continue", "Options", 'configrations', "Quit"];
   
   const BtnShortCut = () => {
        return menulist.map((text,index) => {
            return (
              <button 
                key={index} 
                id={`btn-${index}`}
                onClick={async() => {
                    if (text === "Quit") {
                    if (typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window) {
                     await getCurrentWindow().close();
                    }
                    }
                    else if (text === "Continue") {
                        window.location.href = '/Play/?continue=1';
                    }
                    else {
                        return window.location.href = `/${text}/`;
                    }
                }}
              >
                {text}
              </button>
            );
        });
   };

   return (
      <div id="main-container">
          <BtnShortCut/>
      </div>   
   );
}