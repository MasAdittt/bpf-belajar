import React from 'react';
import '../style/Start.css';

function Start(props) {
  return (
    <div className="Start-List">
      { 
        props.StartList.map((item) => { 
          return (  
            <div className='gatau' key={item.Heading}>
                <div className='gatau-gambar'>
              <img className="gambar-gatau" src={item.image} alt={item.Heading} />
              </div>
              <h1>{item.Heading}</h1>
              <div className='bawah-gatau'> 
                <p>{item.name}</p>
              </div>
            </div>
          );
        })
      }
    </div>
  );
}

export default Start;
