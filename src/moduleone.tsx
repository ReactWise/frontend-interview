import * as React from "react";
import { useEffect, useState, useRef } from "react";

import { Editor } from 'ketcher-react';
import 'ketcher-react/dist/index.css';
import { StandaloneStructServiceProvider } from 'ketcher-standalone';

declare global {
  interface Window {
    ketcher: any;
  }
}

export default function ModuleOne () {

  const smiles = "";
  const [ketcher, setKetcher] = useState<any>(null);
  const structServiceProvider = new StandaloneStructServiceProvider();
  const staticResourcesUrl = import.meta.env.VITE_AUTH0_LOGIN_REDIRECT_URI;
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSmilesRef = useRef<string>("");
  const isLoadingRef = useRef<boolean>(false);

    // Function to get SMILES with proper error handling and debouncing
  const getSmilesAndNotify = async () => {
    if (!ketcher || isLoadingRef.current) return;

    try {
      console.log("=== DETAILED DEBUGGING ===");
      console.log("ketcher.structService state:", ketcher.structService);
      console.log("ketcher._indigo state:", ketcher._indigo);
      console.log("ketcher.standalone:", ketcher.standalone);

      // Wait for the structService to be ready if it's still a Promise
      if (ketcher.structService instanceof Promise) {
        console.log("structService is still a Promise, waiting for it to resolve...");
        try {
          const resolvedService = await ketcher.structService;
          console.log("structService resolved to:", resolvedService);
        } catch (serviceError) {
          console.error("structService failed to resolve:", serviceError);
          return;
        }
      } else {
        console.log("structService is already resolved:", ketcher.structService);
      }

      // Check if there's actually a structure to convert
      console.log("Checking editor state...");
      if (ketcher.editor && ketcher.editor.struct) {
        const struct = ketcher.editor.struct();
        console.log("Current structure:", struct);
        console.log("Structure atoms count:", struct?.atoms?.size || 0);
        console.log("Structure bonds count:", struct?.bonds?.size || 0);

        // If there's no structure, return empty
        if (!struct || (struct.atoms?.size === 0 && struct.bonds?.size === 0)) {
          console.log("No structure to convert, skipping SMILES generation");
          return;
        }
      }

      // Try different approaches to get SMILES
      console.log("=== TRYING MULTIPLE APPROACHES ===");

      // Approach 1: Standard getSmiles
      console.log("Approach 1: Standard getSmiles()");
      try {
        const smilesPromise = ketcher.getSmiles();
        console.log("getSmiles() returned:", smilesPromise);

        // Try to add some debug to the promise itself
        if (smilesPromise instanceof Promise) {
          // Create a promise that resolves with more info
          const debugPromise = smilesPromise.then(
            result => {
              console.log("getSmiles Promise resolved with:", result);
              return result;
            },
            error => {
              console.log("getSmiles Promise rejected with:", error);
              throw error;
            }
          );

          // Race with timeout
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('getSmiles timeout after 5 seconds')), 5000)
          );

          const smilesData = await Promise.race([debugPromise, timeoutPromise]);

          if (smilesData && smilesData !== lastSmilesRef.current && smilesData !== smiles) {
            lastSmilesRef.current = smilesData;
            console.log("Successfully got SMILES via standard method:", smilesData);
            return;
          }
        }
      } catch (error) {
        console.error("Approach 1 failed:", error);
      }

      // Approach 2: Try getMolfile first
      console.log("Approach 2: getMolfile()");
      try {
        const molfilePromise = ketcher.getMolfile();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('getMolfile timeout after 5 seconds')), 5000)
        );

        const molfile = await Promise.race([molfilePromise, timeoutPromise]);
        console.log("Got molfile:", molfile?.substring(0, 200) + "...");

        if (molfile && molfile.trim()) {
          // If we can get molfile, that means the service is working
          // The issue might be specifically with SMILES conversion
          console.log("Molfile conversion works, SMILES issue might be specific");
        }
      } catch (error) {
        console.error("Approach 2 failed:", error);
      }

      // Approach 3: Try getKet
      console.log("Approach 3: getKet()");
      try {
        const ketPromise = ketcher.getKet();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('getKet timeout after 5 seconds')), 5000)
        );

        const ketData = await Promise.race([ketPromise, timeoutPromise]);
        console.log("Got KET data:", ketData?.substring(0, 200) + "...");
      } catch (error) {
        console.error("Approach 3 failed:", error);
      }

      // Approach 4: Try different parameters for getSmiles
      console.log("Approach 4: getSmiles with different parameters");
      try {
        // Try extended SMILES
        const extendedSmilesPromise = ketcher.getSmiles(true);
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Extended getSmiles timeout after 5 seconds')), 5000)
        );

        const extendedSmiles = await Promise.race([extendedSmilesPromise, timeoutPromise]);
        console.log("Got extended SMILES:", extendedSmiles);

        if (extendedSmiles && extendedSmiles !== lastSmilesRef.current && extendedSmiles !== smiles) {
          lastSmilesRef.current = extendedSmiles;
          console.log("Successfully got SMILES via extended method:", extendedSmiles);
          return;
        }
      } catch (error) {
        console.error("Approach 4 failed:", error);
      }

      // Approach 5: Check if there are alternative API methods
      console.log("Approach 5: Looking for alternative methods");
      const allProps = [];
      let obj = ketcher;
      while (obj && obj !== Object.prototype) {
        allProps.push(...Object.getOwnPropertyNames(obj));
        obj = Object.getPrototypeOf(obj);
      }

      const uniqueProps = [...new Set(allProps)];
      const methods = uniqueProps.filter(prop => {
        try {
          return typeof ketcher[prop] === 'function';
        } catch {
          return false;
        }
      });

      console.log("All available methods:", methods);

      // Look for SMILES-related methods
      const smilesMethod = methods.find(m =>
        m.toLowerCase().includes('smiles') && m !== 'getSmiles'
      );

      if (smilesMethod) {
        console.log(`Found alternative SMILES method: ${smilesMethod}`);
        try {
          const result = await ketcher[smilesMethod]();
          console.log(`${smilesMethod} result:`, result);
        } catch (error) {
          console.log(`${smilesMethod} error:`, error);
        }
      }

             // Approach 6: Try working alternative methods as fallback
       console.log("Approach 6: Using working alternatives");
       const workingMethods = ['getSmarts', 'getInchi', 'getInChIKey'];

       for (const method of workingMethods) {
         try {
           console.log(`Trying ${method} as fallback...`);
           const promise = ketcher[method]();
           const timeout = new Promise((_, reject) =>
             setTimeout(() => reject(new Error(`${method} timeout`)), 3000)
           );

           const result = await Promise.race([promise, timeout]);
           console.log(`${method} SUCCESS:`, result);

           if (result && result !== lastSmilesRef.current) {
             lastSmilesRef.current = result;
             console.log(`Successfully using ${method} as SMILES alternative:`, result);
             return; // Exit successfully
           }
         } catch (error) {
           console.log(`${method} failed:`, error instanceof Error ? error.message : String(error));
         }
       }

       console.log("=== END DETAILED DEBUGGING ===");

     } catch (error) {
       console.error('Error in getSmilesAndNotify:', error);
     }
  };

  // Debounced version to avoid too many calls
  const debouncedGetSmiles = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(getSmilesAndNotify, 300);
  };

  // Polling mechanism as fallback
  const startPolling = () => {
    const poll = () => {
      getSmilesAndNotify();
      pollTimerRef.current = setTimeout(poll, 2000); // Poll every 2 seconds
    };
    poll();
  };

  const stopPolling = () => {
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  };

  // Load SMILES into editor when ketcher is ready and smiles prop changes
  useEffect(() => {
    if (ketcher && smiles && smiles !== lastSmilesRef.current) {
      const loadSmiles = async () => {
        try {
          isLoadingRef.current = true;
          // Add a small delay to ensure Ketcher is fully ready
          await new Promise(resolve => setTimeout(resolve, 100));
          await ketcher.setMolecule(smiles);
          lastSmilesRef.current = smiles;
        } catch (error) {
          console.error('Error loading SMILES:', error);
        } finally {
          isLoadingRef.current = false;
        }
      };
      loadSmiles();
    }
  }, [ketcher, smiles]);

  // Handle ketcher initialization
  const handleKetcherInit = async (ketcherInstance: any) => {
    console.log("=== KETCHER INITIALIZATION DEBUG ===");
    console.log("ketcherInstance:", ketcherInstance);
    console.log("ketcherInstance type:", typeof ketcherInstance);
    console.log("ketcherInstance keys:", Object.keys(ketcherInstance || {}));

    // Check what methods are available
    if (ketcherInstance) {
      const methods = Object.getOwnPropertyNames(ketcherInstance).filter(prop =>
        typeof ketcherInstance[prop] === 'function'
      );
      console.log("Available methods on ketcherInstance:", methods);

      // Check specific methods we care about
      ['getSmiles', 'getMolfile', 'getKet', 'setMolecule'].forEach(method => {
        console.log(`${method} exists:`, method in ketcherInstance);
        console.log(`${method} type:`, typeof ketcherInstance[method]);
      });

      // Check if it's a proxy or has special properties
      console.log("ketcherInstance constructor:", ketcherInstance.constructor?.name);
      console.log("ketcherInstance prototype:", Object.getPrototypeOf(ketcherInstance));
    }
    console.log("=== END KETCHER INIT DEBUG ===");

    setKetcher(ketcherInstance);
    window.ketcher = ketcherInstance;

    // Wait for structService to be ready and then test getSmiles
    setTimeout(async () => {
      console.log("Ketcher fully initialized, testing getSmiles immediately...");
      if (ketcherInstance && ketcherInstance.getSmiles) {
        console.log("Calling getSmiles directly from init...");
        try {
          // Wait for structService if it's still a Promise
          if (ketcherInstance.structService instanceof Promise) {
            console.log("Waiting for structService to resolve in init test...");
            await ketcherInstance.structService;
            console.log("structService resolved in init test");
          }

          const testResult = ketcherInstance.getSmiles();
          console.log("Test getSmiles result:", testResult);
          if (testResult instanceof Promise) {
            testResult.then(result => {
              console.log("Test getSmiles resolved with:", result);
            }).catch(error => {
              console.log("Test getSmiles rejected with:", error);
            });
          }
        } catch (error) {
          console.log("Test getSmiles threw error:", error);
        }
      }
    }, 1000); // Increased timeout to give more time for service initialization
  };

  // Set up event listeners when ketcher is ready
  useEffect(() => {
    if (ketcher && ketcher.editor) {
      let eventListenersSetup = false;

      try {
        // Try different event listener approaches

        // Approach 1: Standard event listeners
        if (ketcher.editor.event) {
          console.log("Setting up standard event listeners");

          // Remove existing listeners first to avoid duplicates
          if (ketcher.editor.event.change && ketcher.editor.event.change.removeAll) {
            ketcher.editor.event.change.removeAll();
          }
          if (ketcher.editor.event.bondEdit && ketcher.editor.event.bondEdit.removeAll) {
            ketcher.editor.event.bondEdit.removeAll();
          }

          // Add change listener
          if (ketcher.editor.event.change && ketcher.editor.event.change.add) {
            ketcher.editor.event.change.add((action: any) => {
              console.log("Editor change event:", action);
              debouncedGetSmiles();
            });
            eventListenersSetup = true;
          }

          // Add bond edit listener
          if (ketcher.editor.event.bondEdit && ketcher.editor.event.bondEdit.add) {
            ketcher.editor.event.bondEdit.add((action: any) => {
              console.log("Bond edit event:", action);
              debouncedGetSmiles();
            });
          }

          // Add other relevant listeners
          if (ketcher.editor.event.atomEdit && ketcher.editor.event.atomEdit.add) {
            ketcher.editor.event.atomEdit.add((action: any) => {
              console.log("Atom edit event:", action);
              debouncedGetSmiles();
            });
          }
        }

        // Approach 2: Try direct molecule change notifications
        if (!eventListenersSetup && ketcher.editor.subscribe) {
          console.log("Setting up subscription-based listeners");
          ketcher.editor.subscribe('moleculeChanged', () => {
            console.log("Molecule changed via subscription");
            debouncedGetSmiles();
          });
          eventListenersSetup = true;
        }

        // Approach 3: Try canvas event listeners
        if (!eventListenersSetup && ketcher.editor.render && ketcher.editor.render.clientArea) {
          console.log("Setting up canvas event listeners");
          const canvas = ketcher.editor.render.clientArea;
          const handleCanvasChange = () => {
            console.log("Canvas changed");
            debouncedGetSmiles();
          };

          canvas.addEventListener('mouseup', handleCanvasChange);
          canvas.addEventListener('keyup', handleCanvasChange);
          eventListenersSetup = true;
        }

      } catch (error) {
        console.error('Error setting up event listeners:', error);
      }

      // If none of the event listeners worked, fall back to polling
      if (!eventListenersSetup) {
        console.log("Event listeners failed, falling back to polling");
        startPolling();
      } else {
        console.log("Event listeners setup successful");
        stopPolling(); // Stop polling if we have event listeners
      }
    }

    // Cleanup function
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      stopPolling();
    };
  }, [ketcher ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="h-[700px] w-full flex flex-col">
            {/* Debug buttons */}
      <div className="flex gap-2 p-2 bg-gray-100 flex-wrap">
        <button
          onClick={() => {
            console.log("Manual trigger: getSmilesAndNotify");
            getSmilesAndNotify();
          }}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
        >
          Test getSmiles
        </button>
        <button
          onClick={async () => {
            console.log("=== DIRECT SMILES TEST ===");
            if (ketcher) {
              try {
                console.log("Trying getSmiles() directly...");
                const promise = ketcher.getSmiles();
                console.log("Got promise:", promise);

                // Set up timeout
                const timeout = setTimeout(() => {
                  console.log("Promise is still pending after 3 seconds");
                }, 3000);

                const result = await promise;
                clearTimeout(timeout);
                console.log("Direct SMILES result:", result);
              } catch (e) {
                console.log("Direct call error:", e);
              }
            }
          }}
          className="px-3 py-1 bg-green-500 text-white rounded text-sm"
        >
          Direct Call
        </button>
        <button
          onClick={async () => {
            console.log("=== MOLFILE TEST ===");
            if (ketcher) {
              try {
                console.log("Trying getMolfile()...");
                const molfile = await ketcher.getMolfile();
                console.log("Molfile result:", molfile?.substring(0, 200) + "...");
              } catch (e) {
                console.log("Molfile error:", e);
              }
            }
          }}
          className="px-3 py-1 bg-yellow-500 text-white rounded text-sm"
        >
          Test Molfile
        </button>
        <button
          onClick={async () => {
            console.log("=== ALTERNATIVE EXPORT TESTS ===");
            if (ketcher) {
              const methods = [
                'getSmarts',
                'getCml',
                'getSdf',
                'getInchi',
                'getInChIKey',
                'getCDXml',
                'getRxn'
              ];

              for (const method of methods) {
                try {
                  console.log(`Trying ${method}()...`);
                  const promise = ketcher[method]();

                  // Race with timeout
                  const timeout = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error(`${method} timeout`)), 3000)
                  );

                  const result = await Promise.race([promise, timeout]);
                  console.log(`${method} SUCCESS:`, result?.substring?.(0, 100) || result);

                  // If this is a SMILES-like format, use it!
                  if (method === 'getSmarts' && result && result !== lastSmilesRef.current) {
                    console.log("Using SMARTS as alternative to SMILES!");
                    lastSmilesRef.current = result;
                  }

                } catch (e) {
                  console.log(`${method} failed:`, e instanceof Error ? e.message : String(e));
                }
              }
            }
          }}
          className="px-3 py-1 bg-orange-500 text-white rounded text-sm"
        >
          Test Alternatives
        </button>
        <button
          onClick={async () => {
            console.log("=== SERVICE STATUS ===");
            if (ketcher) {
              console.log("structService:", ketcher.structService);
              console.log("_indigo:", ketcher._indigo);
              console.log("standalone:", ketcher.standalone);

              if (ketcher.structService instanceof Promise) {
                console.log("Service is still a Promise, waiting...");
                try {
                  const service = await ketcher.structService;
                  console.log("Service resolved to:", service);
                } catch (e) {
                  console.log("Service error:", e);
                }
              } else {
                console.log("Service is resolved:", ketcher.structService);
              }
            }
          }}
          className="px-3 py-1 bg-purple-500 text-white rounded text-sm"
        >
          Check Service
        </button>
        <button
          onClick={() => {
            console.log("=== STRUCTURE INFO ===");
            if (ketcher && ketcher.editor) {
              const struct = ketcher.editor.struct();
              console.log("Structure:", struct);
              console.log("Atoms:", struct?.atoms?.size || 0);
              console.log("Bonds:", struct?.bonds?.size || 0);
              console.log("Has content:", (struct?.atoms?.size > 0 || struct?.bonds?.size > 0));
            }
          }}
          className="px-3 py-1 bg-red-500 text-white rounded text-sm"
        >
          Check Structure
        </button>
      </div>

      <div className="flex-1 h-[600px]">
        <Editor
          staticResourcesUrl={staticResourcesUrl}
          structServiceProvider={structServiceProvider}
          errorHandler={(error: any) => {
            console.error("Ketcher error:", error);
          }}
          onInit={handleKetcherInit}
          disableMacromoleculesEditor={true}
        />
      </div>
    </div>
  );
};
