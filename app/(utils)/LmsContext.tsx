import React, { createContext, useState } from 'react';


const Context = createContext();
 const LmsContext = ({children}) => {
    const [data,setData]=useState("Testing");
  return (
     <Context.Provider  value={{data,setData}}  >
        {children}
     </Context.Provider>
  )
}

export default LmsContext;