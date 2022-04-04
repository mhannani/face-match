import React from "react";
import SyncLoader from "react-spinners/SyncLoader";

const Loading = ({message}) => {
  return (
      <div className={'app_loader'}>
        <SyncLoader size={18} />
        <h4>{message}</h4>
      </div>
  );
};

export default Loading;
