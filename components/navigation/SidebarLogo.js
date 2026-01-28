"use client";

export default function SidebarLogo({
  title = "GrupChat",
  imageSrc = "/logo.png",
}) {
  return (
    <div className="flex items-center gap-3">
      <img
        src={imageSrc}
        alt={`${title} Logo`}
        className="w-12 h-12 object-cover"
      />
      <span className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
        {title}
      </span>
    </div>
  );
}
