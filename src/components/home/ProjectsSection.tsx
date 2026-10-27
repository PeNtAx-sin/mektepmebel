import Link from "next/link";
import type { Project } from "@/lib/data";
import ProjectGallery from "./ProjectGallery";

/** Блок «Готовые проекты»: обставленные кабинеты; метки 3D-схемы ведут сюда */
export default function ProjectsSection({ projects }: { projects: Project[] }) {
  return (
    <section id="projects" className="scroll-mt-24 py-20 max-w-7xl mx-auto px-4 sm:px-8">
      <div className="mb-12 max-w-2xl">
        <span className="text-brand-600 font-bold text-xs uppercase tracking-wider block mb-2">
          Готовые проекты
        </span>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
          Обставленные кабинеты с нашей мебелью
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <article
            key={project.id}
            id={`project-${project.id}`}
            className="scroll-mt-28 bg-white rounded-3xl p-4 border border-slate-200 shadow-sm transition target:ring-4 target:ring-brand-400"
          >
            <ProjectGallery photos={project.photos} isVisualization={project.isVisualization} />
            <div className="px-1 pt-4 space-y-2">
              <h3 className="text-lg font-bold text-slate-900 leading-snug">{project.title}</h3>
              {project.location && (
                <p className="text-xs text-slate-500">
                  <i className="fa-solid fa-location-dot text-brand-500 mr-1.5" />
                  {project.location}
                </p>
              )}
              {project.products.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {project.products.map((product) => (
                    <Link
                      key={product.href}
                      href={product.href}
                      className="text-[11px] font-medium bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-700 px-2.5 py-1 rounded-lg transition"
                    >
                      {product.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
