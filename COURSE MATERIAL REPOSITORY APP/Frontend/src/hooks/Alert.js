const Alert = ({type, messages}) => {
    if (messages || messages.length===0) return null

  return (
    <div>
        <style>
            {`
            .alert{
            padding: 15px;
            margin-bottom:20px;
            border: 1px solid transparent;
            border-radius: 4px;                 
            }

            .alert-success {
            background-color:#d4edda;
            border-color: #c3e6cb;
            color:#155724;
            }

            .alert-danger{
            backgground-color:#f8d7da;
            border-color:#f5c6cb;
            color:#721c24;            
            }

            .alert-warning{
            background-color:#fff3cd;
            border-color:#ffeeba;
            color:#856404;
            }
            `}
        </style>
    <div className={`alert alert-${type}`} role='alert'>
    {messages.map((message, index)=>(
        <div key={index} className="alert-message">
           {message}
        </div>
    ))}      
    </div>
    </div>
  );
};

export default Alert













