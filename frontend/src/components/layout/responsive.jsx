export default function ResponsiveDemo() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Demo Content */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Layout Responsive</h2>
          <div className="space-y-3 text-slate-600">
            <p>✅ <strong>Desktop:</strong> Sidebar collapsible avec bouton toggle</p>
            <p>✅ <strong>Tablet/Mobile:</strong> Menu hamburger avec sidebar en overlay</p>
            <p>✅ <strong>Header:</strong> Responsive avec éléments qui s'adaptent</p>
            <p>✅ <strong>Content:</strong> S'adapte automatiquement à la taille de l'écran</p>
          </div>
        </div>

        {/* Sample Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
                <Users className="text-blue-600" size={24} />
              </div>
              <h3 className="text-slate-600 text-sm mb-2">Métrique {i}</h3>
              <p className="text-2xl font-bold text-slate-900">1,234</p>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}