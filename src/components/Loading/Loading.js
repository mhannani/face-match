import React from "react";
import SyncLoader from "react-spinners/SyncLoader";

const Loading = () => {
  return (
      <div className={'app_loader'}>
        <SyncLoader size={18} />
        <h4>Getting environment ready...</h4>
      </div>
  );
};

export default Loading;
