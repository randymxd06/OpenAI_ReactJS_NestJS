import { useRef, useState } from "react"
import { GptMessage, MyMessage, TypingLoader, TextMessageBox } from "../../components";
import { prosConsStreamGeneratorUseCase } from "../../../core/use_cases";

interface Message {
  text:   string;
  isGpt:  boolean;
}

export const ProsConsStreamPage = () => {

  const abortController = useRef( new AbortController() );
  const isRunning = useRef(false);

  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  /**------------------------
   ** HANDLE POST FUNCTION
   *  @param text 
  ---------------------------*/
  const handlePost = async (text: string) => {

    if( isRunning.current ) {
      abortController.current.abort();
      abortController.current = new AbortController();
    }

    setIsLoading(true);

    isRunning.current = true;

    setMessages((prev) => [...prev, { text: text, isGpt: false }]);

    const stream = prosConsStreamGeneratorUseCase( text, abortController.current.signal );

    setIsLoading(false);

    setMessages((prev) => [...prev, { text: '', isGpt: true }]);

    for await (const text of stream) {
      setMessages((messages) => {
        const newMessages = [ ...messages ];
        newMessages[ newMessages.length - 1 ].text = text;
        return newMessages;
      })
    }

    isRunning.current = false;

  }

  return (
    <div className="chat-container">

      {/* CHAT MESSAGES */}
      <div className="chat-messages">

        <div className="grid grid-cols-12 gap-y-2">
          
          {/* WELCOME */}
          <GptMessage text="¿Qué deseas comparar hoy?" />

          {/* MY MESSAGES */}
          {
            messages.map((message, index) => (
              message.isGpt 
              ? ( <GptMessage key={ index } text={ message.text } /> )
              : ( <MyMessage key={ index } text={ message.text } /> )
            ))
          }

          {/* TYPING LOADER */}
          {
            isLoading && (
              <div className="col-start-1 col-end-12 fade-in">
                <TypingLoader className="fade-in" />
              </div>
            )
          }

        </div>

      </div>

      {/* CHAT MESSAGE BOX */}
      <TextMessageBox 
        onSendMessage={ handlePost } 
        placeholder="Escribe lo que deseas"
        disableCorrections
      />

    </div>
  )
}
