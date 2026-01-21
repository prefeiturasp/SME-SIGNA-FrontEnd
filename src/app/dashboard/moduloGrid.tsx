"use client";

import { ComponentType } from "react";

type Module = {
  id: string;
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
};

export default function ModuleGrid({ modules }: { modules: Module[] }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
            {modules.map((module) => (
                <div
                    key={module.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center text-center"
                >
                    <div className="w-14 h-14 flex items-center justify-center rounded-full bg-gray-400 mb-4">
                        <module.icon className="w-7 h-7 text-white" />
                    </div>


                    <h2 className="font-semibold text-lg text-gray-400">
                        {module.title}
                    </h2>

                    <p className="text-sm text-gray-600 mt-2 flex-1">
                        {module.description}
                    </p>

                    <button
                        className="mt-6 bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-md text-sm font-medium"
                        // to-do: arrumar link
                        onClick={() => console.log("Abrir módulo:", module.id)}
                    >
                        Abrir módulo
                    </button>
                </div>
            ))}
        </div>
    );
}
