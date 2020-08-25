import React, { useState } from 'react';
import { useObservable } from 'rxjs-hooks';
import { Observable } from 'rxjs';
import { map, withLatestFrom } from 'rxjs/operators';
import { endpointUrls } from './config';

const stringObservable = Observable.create(observer => {
  const source = new EventSource(endpointUrls.pythonStream);
  source.addEventListener('message', (messageEvent) => {
    console.log(messageEvent);
    observer.next(messageEvent.data);
  }, false);

  // The next two hooks are not needed but useful to show other things that can
  // be monitored
  source.addEventListener('open', function(e) {
    // Connection was opened.
  }, false);
  
  source.addEventListener('error', function(e) {
    if (e.readyState == EventSource.CLOSED) {
      // Connection was closed.
    }
  }, false);
});

function App() {
  const [stringArray, setStringArray] = useState([]);

  useObservable(
    state =>
      stringObservable.pipe(
        withLatestFrom(state),
        map(([state]) => {
          let updatedStringArray = stringArray;
          updatedStringArray.unshift(state);
          if (updatedStringArray.length >= 50) {
            updatedStringArray.pop();
          }
          setStringArray(updatedStringArray);
          return state;
        })
      )
  );

  return (
    <>
      {stringArray ? stringArray.map((message, index) => <p key={index}>{message}</p>) : <p>Loading...</p>}
    </>
  );
}

export default App;