import React, { useEffect, useState, useContext, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "../config/axios";
import {
  initializeSocket,
  receiveMessage,
  sendMessage,
} from "../config/socket";
import { UserContext } from "../context/user.context";
import Markdown from "markdown-to-jsx";
import { getWebContainer } from "../config/webContainer";

import hljs from "highlight.js";

function SyntaxHighlightedCode(props) {
  const ref = useRef(null);

  React.useEffect(() => {
    if (ref.current && props.className?.includes("lang-") && window.hljs) {
      window.hljs.highlightElement(ref.current);

      // hljs won't reprocess the element unless this attribute is removed
      ref.current.removeAttribute("data-highlighted");
    }
  }, [props.className, props.children]);

  return <code {...props} ref={ref} />;
}

const Project = () => {
  const location = useLocation();

  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState([]);
  const [project, setProject] = useState(location.state.project);
  const [message, setMessage] = useState("");
  const messageBox = React.createRef();

  const { user } = useContext(UserContext);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [fileTree, setFileTree] = useState({});
  //  console.log(fileTree["package.json"].file.contents)

  const [currentFile, setCurrentFile] = useState(null);
  const [openFiles, setOpenFiles] = useState([]);
  const [webContainer, setWebContainer] = useState(null);
  const [iframeUrl, setIframeUrl] = useState(null)
  const [ runProcess, setRunProcess ] = useState(null)

  const handleUserClick = (id) => {
    setSelectedUserId((provSelectedUserId) => {
      const newSelectedUserId = new Set(provSelectedUserId);
      if (newSelectedUserId.has(id)) {
        newSelectedUserId.delete(id);
      } else {
        newSelectedUserId.add(id);
      }
      console.log(Array.from(newSelectedUserId));
      return newSelectedUserId;
    });
  };

  function addCollaborators() {
    axios
      .put("/projects/add-user", {
        projectId: location.state.project._id,
        users: Array.from(selectedUserId),
      })
      .then((res) => {
        console.log(res.data);
        setIsModalOpen(false);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  const send = () => {
    console.log(user);

    if (!message == "") {
      sendMessage("project-message", {
        message,
        sender: user,
      });
      //  appendOutgoingMessage(message)
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: user, message },
      ]);

      setMessage("");
    }
  };

  function WriteAiMessage(message1) {
    const messageObject = JSON.parse(message1);

    return (
      <div className="overflow-auto bg-slate-950 text-white rounded-sm p-2">
        <Markdown
          children={messageObject.text}
          options={{
            overrides: {
              code: SyntaxHighlightedCode,
            },
          }}
        />
      </div>
    );
  }

  useEffect(() => {
    initializeSocket(project._id);

    if (!webContainer) {
      getWebContainer().then((container) => {
        setWebContainer(container);
        console.log("container started");
      });
    }

    receiveMessage("project-message", (data) => {
      const message = JSON.parse(data.message);
      console.log(message);

      webContainer?.mount(message.fileTree);

      if (message.fileTree) {
        setFileTree(message.fileTree || {});
      }

      setMessages((prevMessages) => [...prevMessages, data]);
    });

    axios
      .get(`/projects/get-project/${location.state.project._id}`)
      .then((response) => {
        setProject(response.data.project);
      })
      .catch((err) => {
        console.log(err);
      });

    axios
      .get("/users/all")
      .then((response) => {
        setUsers(response.data.users);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  function saveFileTree(ft) {
    axios.put('/projects/update-file-tree', {
        projectId: project._id,
        fileTree: ft
    }).then(res => {
        console.log(res.data)
    }).catch(err => {
        console.log(err)
    })
}
// 
  const scrollToBottom = () => {
    messageBox.current.scrollTop = messageBox.current.scrollHeight;
  };

  return (
    <main className="h-screen w-screen overflow-hidden flex">
      <section className="left h-full h-full min-w-70 relative ">
        <header className="flex  justify-between items-center p-2 w-full h-[10%]  bg-zinc-200">
          <div className="flex items-center  flex-col">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-white py-1 px-1.5 rounded-2xl flex shadow "
            >
              <i class="ri-add-large-fill text-[10px]"></i>
            </button>
            <h2 className="text-[7px] ">Add collaborator</h2>
          </div>

          <button
            onClick={() => setIsSidePanelOpen(true)}
            className="flex items-center space-x-4 bg-white px-2 py-1  cursor-pointer rounded-lg shadow-md "
          >
            <i className="ri-group-fill"></i>
          </button>
        </header>

        <div className="conversation-area flex flex-col w-full h-[90%] justify-between">
          <div
            ref={messageBox}
            className="message-box flex-grow flex-col flex  h-full w-full bg-blue-50 overflow-auto  p-2 gap-2 no-scrollbar"
          >
            {messages.map((msg, index) => {
              {
                /* console.log(msg.message) */
              }
              return (
                <div
                  key={index}
                  className={`${
                    msg.sender._id === "ai" ? "max-w-80" : "max-w-52"
                  } ${
                    msg.sender._id == user._id.toString() && "ml-auto"
                  }  message flex flex-col p-2 bg-blue-100 w-fit rounded-md`}
                >
                  <small className="opacity-65 text-xs">
                    {msg.sender.email}
                  </small>
                  <div className="text-sm ">
                    {msg.sender._id === "ai" ? (
                      WriteAiMessage(msg.message)
                    ) : (
                      <p>{msg.message}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="inputField flex justify-between w-full gap-2 items-center px-4 py-3   bg-zinc-200 ">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="bg-white outline-none py-1 rounded-sm px-1"
              type="text"
              placeholder="Type a message"
            />
            <button
              onClick={send}
              className="flex justify-center items-center space-x-4 bg-white px-2 py-1  rounded-xl shadow-md "
            >
              <i className="ri-send-plane-2-fill"></i>
            </button>
          </div>
        </div>

        <div
          className={`sidePanel bg-slate-200 w-full h-full pt-12 px-5 absolute  ${
            isSidePanelOpen ? "" : "-translate-x-full"
          } top-0 transition-all duration-400 ease-in-out`}
        >
          <h1 className="text-lg font-semibold">Collaborators</h1>
          <button
            className="absolute top-2 right-3 bg-white px-1 rounded-2xl  cursor-pointer shadow-md"
            onClick={() => setIsSidePanelOpen(false)}
          >
            <i className="ri-close-line"></i>
          </button>

          <div className="users flex flex-col gap-2  w-full h-full py-1">
            {project.users &&
              project.users.map((user) => {
                return (
                  <div className="user flex w-full items-center gap-4 bg-slate-50 p-1.5 rounded-full shadow-sm hover:bg-slate-100">
                    <div>
                      <img
                        className="w-10 rounded-full  shadow-md"
                        src="https://img.freepik.com/free-vector/businessman-character-avatar-isolated_24877-60111.jpg?ga=GA1.1.1734364353.1740491771&semt=ais_hybrid"
                        alt=""
                      />
                    </div>
                    <h1 className="text-sm">{user.email}</h1>
                  </div>
                );
              })}
          </div>
        </div>
      </section>

      <section className="right  flex-grow  h-full flex ">
        {currentFile && (
       

      <div className="code-editor flex  w-[80%] h-full bg-slate-50 px-2 gap-1 py-1">
      {iframeUrl && webContainer && 
      <div className="w-[30%] flex-col h-full" >
      
      <div className="address-ber">
        <input type="text"
        onChange={(e) => setIframeUrl(e.target.value)}
         value={iframeUrl} className="w-full p-2 px-4 bg-slate-200" />
      </div>

        <iframe src={iframeUrl} className=" h-full" ></iframe>
        </div>
      }

      <div className="w-[90%]" >
        <div className="top flex w-[90%]  justify-between gap-1">
          <div className="flex files overflow-x-auto w-[90%]">
                {openFiles.map((file, index) => (
                  <button
                    onClick={() => setCurrentFile(file)}
                    className={`open-file cursor-pointer p-2 px-4 flex items-center w-fit gap-2 bg-slate-200 ${
                      currentFile === file ? "bg-slate-400" : ""
                    } `}
                  >
                    <p className="font-semibold text-lg">{file}</p>
                  </button>
                ))}
          </div>

 <div className="actions flex  gap-2">
  <button onClick={async () => {
await webContainer.mount(fileTree);
const installProcess = await webContainer.spawn("npm", [
       "install",
     ]);

     installProcess.output.pipeTo(
       new WritableStream({
         write(chunk) {
           console.log(chunk);
          },
        })
      );

      if (runProcess) {
        runProcess.kill();
      }

 let tempRunProcess = await webContainer.spawn("npm", [
          "start",
                ]);
   tempRunProcess.output.pipeTo(
     new WritableStream({
       write(chunk) {
          console.log(chunk);
           },
         })
       );
       setRunProcess(tempRunProcess);

      webContainer.on("server-ready", (port, url) => {
    console.log(port, url);
        setIframeUrl(url);
      });
    }}
    className="p-2 px-4 bg-green-400 text-white"
       >
                  run
                </button>
              </div>
            </div>

            <div className="bottom h-full w-fill bg-white p-4 rounded-xl">
              {fileTree[currentFile] && (
                <div className="code-editor-area h-full overflow-auto flex-grow bg-slate-200">
    <pre className="hljs h-full">
      <code
        className="hljs h-full outline-none"
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => {
          const updatedContent = e.target.innerText;
          const ft = {
            ...fileTree,
            [currentFile]: {
              file: {
                contents: updatedContent,
              },
            },
          };
          setFileTree(ft);
          saveFileTree(ft);
        }}
        dangerouslySetInnerHTML={{
          __html: hljs.highlight(
            "javascript",
            fileTree[currentFile].file.contents
          ).value,
        }}
        style={{
          whiteSpace: "pre-wrap",
          paddingBottom: "25rem",
          counterSet: "line-numbering",
                      }}
                    />
                  </pre>
                </div>
              )}
            </div>
        </div>
          </div>
        )}



        <div className="explorer h-full w-[20%] bg-green-100">
          <div className="file-tree w-full">
            {Object.keys(fileTree).map((file, index) => {
              return (
                <button
                  onClick={() => {
                    setCurrentFile(file);
                    setOpenFiles([...new Set([...openFiles, file])]);
                  }}
                  className="tree-element p-2 px-4 flex items-center gap-2 bg-slate-100 border-b-1 border-slate-500 w-full "
                >
                  <p class=" cursor-pointer font-semibold text-lg">{file}</p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white  relative rounded-lg shadow-lg p-4 w-9/20 max-w-[300px] md:w-1/2 lg:w-1/3 text-sm">
            <button
              className="  absolute top-2 right-2 bg-green-200 cursor-pointer rounded-full p-1 px-2"
              onClick={() => setIsModalOpen(false)}
            >
              <i className="ri-close-line"></i>
            </button>
            <h2 className="text-xl mb-4">Select a User</h2>
            <ul className="space-y-2 mb-5 max-h-50 overflow-auto   ">
              {users.map((user) => (
                <li
                  key={user._id}
                  className={`flex items-center p-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200  ${
                    Array.from(selectedUserId).indexOf(user._id) !== -1
                      ? "bg-gray-200"
                      : ""
                  }`}
                  onClick={() => handleUserClick(user._id)}
                >
                  <img
                    className="w-10 h-10 rounded-full mr-3"
                    src="https://img.freepik.com/free-vector/businessman-character-avatar-isolated_24877-60111.jpg?ga=GA1.1.1734364353.1740491771&semt=ais_hybrid"
                    alt={user.email}
                  />
                  <span>{user.email}</span>
                </li>
              ))}
            </ul>

            <div className="flex w-full justify-center">
              <button
                onClick={addCollaborators}
                className="py-2 px-4 bg-green-400  cursor-pointer rounded-sm text-white mt-3 hover:bg-green-500 "
              >
                {" "}
                Add Collaborators{" "}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Project;
