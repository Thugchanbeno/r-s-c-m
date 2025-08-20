import { useState } from "react";
import Modal from "@/components/common/Modal";
import { Plus, Edit2, Trash2, Search, Tag, Users, TrendingUp } from "lucide-react";

const SkillsDatabaseModal = ({ isOpen, onClose, skillsData, onUpdateSkillsData }) => {
  const [skills, setSkills] = useState([
    {
      id: 1,
      name: "JavaScript",
      category: "Programming Languages",
      level: "Intermediate",
      userCount: 45,
      trending: true,
      description: "Modern JavaScript programming language",
      relatedSkills: ["React", "Node.js", "TypeScript"],
    },
    {
      id: 2,
      name: "React",
      category: "Frontend Frameworks",
      level: "Advanced",
      userCount: 32,
      trending: true,
      description: "React library for building user interfaces",
      relatedSkills: ["JavaScript", "Redux", "Next.js"],
    },
    {
      id: 3,
      name: "Project Management",
      category: "Soft Skills",
      level: "Expert",
      userCount: 28,
      trending: false,
      description: "Planning and executing projects effectively",
      relatedSkills: ["Leadership", "Communication", "Agile"],
    },
  ]);

  const [categories, setCategories] = useState([
    "Programming Languages",
    "Frontend Frameworks",
    "Backend Technologies",
    "Databases",
    "Cloud Platforms",
    "Soft Skills",
    "Design Tools",
    "DevOps",
  ]);

  const [newSkill, setNewSkill] = useState({
    name: "",
    category: "",
    description: "",
    relatedSkills: [],
  });

  const [newCategory, setNewCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  const filteredSkills = skills.filter((skill) => {
    const matchesSearch = skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         skill.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || skill.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddSkill = () => {
    if (newSkill.name.trim() && newSkill.category) {
      const skill = {
        ...newSkill,
        id: Date.now(),
        level: "Beginner",
        userCount: 0,
        trending: false,
      };
      setSkills([...skills, skill]);
      setNewSkill({ name: "", category: "", description: "", relatedSkills: [] });
      setIsAddingSkill(false);
    }
  };

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory]);
      setNewCategory("");
      setIsAddingCategory(false);
    }
  };

  const deleteSkill = (skillId) => {
    setSkills(skills.filter(skill => skill.id !== skillId));
  };

  const deleteCategory = (categoryName) => {
    const hasSkills = skills.some(skill => skill.category === categoryName);
    if (!hasSkills) {
      setCategories(categories.filter(cat => cat !== categoryName));
    }
  };

  const getCategoryStats = (categoryName) => {
    const categorySkills = skills.filter(skill => skill.category === categoryName);
    const totalUsers = categorySkills.reduce((sum, skill) => sum + skill.userCount, 0);
    return {
      skillCount: categorySkills.length,
      userCount: totalUsers,
    };
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Skills Database Management" size="xl">
      <div className="space-y-6">
        {/* Search and Filters */}
        <div className="flex space-x-4">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border rounded-md"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <button
            onClick={() => setIsAddingSkill(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus size={16} className="mr-2" />
            Add Skill
          </button>
        </div>

        {/* Add New Skill Modal */}
        {isAddingSkill && (
          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="font-medium mb-3">Add New Skill</h3>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Skill name"
                value={newSkill.name}
                onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                className="px-3 py-2 border rounded-md"
              />
              <select
                value={newSkill.category}
                onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
                className="px-3 py-2 border rounded-md"
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <textarea
              placeholder="Skill description"
              value={newSkill.description}
              onChange={(e) => setNewSkill({ ...newSkill, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-md mt-3"
              rows="2"
            />
            <div className="flex space-x-3 mt-3">
              <button
                onClick={handleAddSkill}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add Skill
              </button>
              <button
                onClick={() => setIsAddingSkill(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Skills List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Skills ({filteredSkills.length})</h3>
            <div className="text-sm text-gray-600">
              Total users with skills: {skills.reduce((sum, skill) => sum + skill.userCount, 0)}
            </div>
          </div>
          
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {filteredSkills.map((skill) => (
              <div key={skill.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Tag className="text-blue-600 mr-3" size={16} />
                    <div>
                      <div className="flex items-center">
                        <h4 className="font-medium mr-2">{skill.name}</h4>
                        {skill.trending && (
                          <TrendingUp className="text-green-600" size={14} />
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{skill.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="flex items-center text-sm text-gray-600">
                        <Users size={14} className="mr-1" />
                        {skill.userCount} users
                      </div>
                      <span className="text-xs text-gray-500">{skill.level}</span>
                    </div>
                    <div className="flex space-x-2">
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => deleteSkill(skill.id)}
                        className="p-1 hover:bg-gray-100 rounded text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
                
                {skill.description && (
                  <p className="text-sm text-gray-600 mb-2">{skill.description}</p>
                )}
                
                {skill.relatedSkills.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    <span className="text-xs text-gray-500 mr-2">Related:</span>
                    {skill.relatedSkills.map((relatedSkill) => (
                      <span
                        key={relatedSkill}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                      >
                        {relatedSkill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Categories Management */}
        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Categories ({categories.length})</h3>
            <button
              onClick={() => setIsAddingCategory(true)}
              className="flex items-center px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              <Plus size={14} className="mr-1" />
              Add Category
            </button>
          </div>

          {isAddingCategory && (
            <div className="flex space-x-3 mb-4">
              <input
                type="text"
                placeholder="Category name"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-md"
              />
              <button
                onClick={handleAddCategory}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add
              </button>
              <button
                onClick={() => setIsAddingCategory(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {categories.map((category) => {
              const stats = getCategoryStats(category);
              return (
                <div key={category} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{category}</h4>
                    <p className="text-sm text-gray-600">
                      {stats.skillCount} skills • {stats.userCount} users
                    </p>
                  </div>
                  <button
                    onClick={() => deleteCategory(category)}
                    disabled={stats.skillCount > 0}
                    className="p-1 hover:bg-gray-100 rounded text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default SkillsDatabaseModal;