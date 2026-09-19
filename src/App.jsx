import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Projects from "./pages/Projects";
import About from "./pages/About";
import Contact from "./pages/Contact";
import ProjectDetail from "./pages/ProjectDetail";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/:id" element={<ProjectDetail />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="*" element={<Home />} />
      </Route>
    </Routes>
  );
}