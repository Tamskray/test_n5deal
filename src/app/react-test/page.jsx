"use client";

import React, { useState, useEffect } from "react";

const API_URL = "https://jsonplaceholder.typicode.com/users";

const styles = {
  listItem: {
    margin: "6px",
    padding: "4px",
    border: "1px solid black",
    width: "350px",
  },
  input: {
    border: "1px solid black",
  },
};

function UsersList({ users, allUsersCount, onDelete }) {
  if (!users?.length) {
    return <div>No users found</div>;
  }

  return (
    <>
      <div>
        Showing {users?.length} of {allUsersCount} users
      </div>

      <ul>
        {users.map((item) => (
          <li
            className="m-3 p-3 border border-black w-87 flex justify-between items-center"
            key={item.id}
          >
            <div>
              <h3>{item.name}</h3>
              <p>{item.email}</p>
              <p>Company - {item.company.name}</p>
            </div>
            <button
              className="h-7 border border-black hover:bg-gray-300"
              onClick={() => onDelete(item.id)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}

export default function App() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [sortBy, setSortBy] = useState("");

  const filteredUsers = users
    .filter((item) => item.name.toLowerCase().includes(debouncedSearch.toLowerCase()))
    .sort((a, b) => {
      if (!sortBy) return 0;
      const sortResult = a.name.localeCompare(b.name);
      return sortBy === "ASC" ? sortResult : -sortResult;
    });

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const handleDeleteUser = (id) => {
    const updatedUsers = users.filter((user) => user.id !== id);
    setUsers(updatedUsers);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchUsers = async (controller) => {
      try {
        setLoading(true);

        const response = await fetch(API_URL, { signal: controller.signal });

        if (!response.ok) {
          setError("Error response");
          throw new Error(`HTTP ${response.status}`);
        }

        const res = await response.json();
        setUsers(res);
      } catch (e) {
        if (e.name === "AbortError") return;
        setError("Error fetching " + e.message);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchUsers(controller);

    return () => controller.abort();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Users:</h1>

      <input
        name="search"
        placeholder="Search by name"
        value={search}
        style={styles.input}
        onChange={(event) => handleSearch(event)}
      />

      <p>
        <button onClick={() => setSortBy("ASC")}>Sort ASC</button>
        <button onClick={() => setSortBy("DESC")}>Sort DESC</button>
      </p>

      <UsersList users={filteredUsers} allUsersCount={users?.length} onDelete={handleDeleteUser} />
    </div>
  );
}
