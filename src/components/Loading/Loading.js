import React from "react";
import SyncLoader from "react-spinners/SyncLoader";
import HashLoader from "react-spinners/HashLoader";

const Loading = ({message, variant}) => {
  return (
      <div className={'app_loader'}>
          {
              variant === 'sync' ? <SyncLoader size={18} /> : <HashLoader size={40}/>
          }
        <h4>{message}</h4>
      </div>
  );
};

export default Loading;
