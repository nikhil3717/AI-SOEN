import React, { useContext, useEffect, useState } from "react";
import axios from "../config/axios";
import { UserContext } from "../context/user.context";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { user } = useContext(UserContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [project, setProject] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("/projects/all")
      .then((res) => {
        // console.log(res.data)
        setProject(res.data.projects);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  function createProject(e) {
    e.preventDefault();
    console.log({ projectName });

    axios
      .post("/projects/create", {
        name: projectName,
      })
      .then((res) => {
        console.log(res);
        setIsModalOpen(false);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  return (
    <main className="p-4">
      <div className="projects flex flex-wrap gap-4 ">
        <button
          onClick={() => setIsModalOpen(true)}
          className="project p-4 border border-slate-200 rounded-lg shadow-md hover:bg-green-300"
        >
          {" "}
          New Project
          <i className="ri-link ml-2 "></i>
        </button>

        {project.map((project) => (
          <div
            key={project._id}
            onClick={() =>
              navigate(`/project`, {
                state: { project },
              })
            }
            className="project p-4 border border-slate-200 rounded-lg shadow-md min-w-52 hover:bg-blue-200 "
          >
            <h1 className="font-semibold ">{project.name}</h1>

            <div className="flex gap-2 mt-2">
              <p className="text-sm">
                <i className="ri-user-3-fill"></i> Collaborators:{" "}
                {project.users.length}{" "}
              </p>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl mb-4">Create New Project</h2>
            <form onSubmit={createProject}>
              <input
                type="text"
                placeholder="Project Name"
                className="border border-gray-300 p-2 rounded w-full mb-4"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default Home;
