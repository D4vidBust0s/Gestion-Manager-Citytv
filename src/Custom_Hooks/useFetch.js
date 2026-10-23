import { useEffect, useState } from 'react';
import axios from 'axios';

export const useFetch = (url, type ) => {
 
    const [state, setState] = useState({

        data: null,
        isLoading: true,
        hasError: false,
        error: null,
        
    });

        const getFetch = async () => {

          if(type === 'GET') {
            {
                try {
                    await axios.get(url)
                    .then((response) => setState({ data: response.data, isLoading: false, hasError: false }))
                    .catch((error) => setState({ data: null, isLoading: false, hasError: true, error: error.message }));
                }

                catch (error) {
                setState({ data: null, isLoading: false, hasError: true, error: error.message });
            }

            }
          }
            
      
    }

    //EFFECTOS
    /*----------------------------------------------------------------------------------------------------*/

    useEffect(() => {
        getFetch();
    }, [url]);

    /*----------------------------------------------------------------------------------------------------*/

    return {
        data: state.data,
        isLoading: state.isLoading,
        hasError: state.hasError,
        error: state.error,
    }
}
