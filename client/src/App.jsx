import "./App.css";
import { useEffect, useState } from "react";
import API from "./services/api";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";

function App() {
    const [habits, setHabits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [title, setTitle] = useState("");  // Stores habit name
    const [description, setDescription] = useState("");  // stores habit details
    const [frequency, setFrequency] = useState("daily");   // stores daily or weekly
    const [submitting, setSubmitting] = useState(false);    // prevents duplicate from submissions
    const [editingId, setEditingId] = useState(null);  // identifies which habit is being edited
    const [editTitle, setEditTitle] = useState("");   // stores the updated title
    const [editDescription, setEditDescription] = useState(""); // stores the updated description
    const [editFrequency, setEditFrequency] = useState("daily");  // stores the updated frequency
    const [completedHabits, setCompletedHabits] = useState([]);
    const [checkInLoading, setCheckInLoading] = useState({});
    const [dashboardSummary, setDashboardSummary] = useState(null);
    const [weeklyProgress, setWeeklyProgress] = useState([]);

    // Fetch habits when the component loads

        // Fetch today's completed habits

const fetchTodayCheckIns = async () => {
    try {
        const response = await API.get("/habits/today");

        const completedIds = response.data.data.map(
            (item) => String(item.habitId)
        );

        setCompletedHabits(completedIds);

    } catch (error) {
        console.error(
            "Failed to fetch today's check-ins:",
            error
        );
    }
};
    
// Fetch dashboard summary
const fetchDashboardSummary = async () => {
    try {
        const response = await API.get("/dashboard/summary");

        setDashboardSummary(response.data.data);

    } catch (error) {
        console.error("Failed to fetch dashboard summary:", error);
    }
};

// Fetch weekly progress data
const fetchWeeklyProgress = async () => {
    try {
        const response = await API.get("/dashboard/weekly-progress");

        setWeeklyProgress(response.data.data.weeklyProgress);
    } catch (error) {
        console.error("Failed to fetch weekly progress:", error);
    }
};

// Fetch habits when the component loads
useEffect(() => {
    const fetchHabits = async () => {
        try {
            const response = await API.get("/habits");

            setHabits(response.data.data);

            // Fetch today's completed habits
            await fetchTodayCheckIns();
            await fetchDashboardSummary();
            await fetchWeeklyProgress();

        } catch (error) {
            setError("Failed to load habits. Please check your server.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    fetchHabits();
}, []);


    // Add a new habit
const handleAddHabit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
        setError("Habit title is required");
        return;
    }

    try {
        setSubmitting(true);
        setError("");

        const response = await API.post("/habits", {
            title,
            description,
            frequency
        });

        // Add the newly created habit to the existing list
        setHabits((prevHabits) => [
            ...prevHabits,
            response.data.data
        ]);

        // Refresh dashboard statistics
        await fetchDashboardSummary();
        await fetchWeeklyProgress();

        // Clear the form
        setTitle("");
        setDescription("");
        setFrequency("daily");

    } catch (error) {
        setError(
            error.response?.data?.message ||
            "Failed to create habit"
        );
    } finally {
        setSubmitting(false);
    }
};


// Delete a habit
const handleDeleteHabit = async (id) => {
    try {
        await API.delete(`/habits/${id}`);

        // Remove the deleted habit from React state
        setHabits((prevHabits) =>
            prevHabits.filter((habit) => habit._id !== id)
        );

        // Refresh dashboard data
        await fetchDashboardSummary();
        await fetchWeeklyProgress();

    } catch (error) {
        setError(
            error.response?.data?.message ||
            "Failed to delete habit"
        );
    }
};

// Start editing a habit
const handleEditClick = (habit) => {
    setEditingId(habit._id);
    setEditTitle(habit.title);
    setEditDescription(habit.description);
    setEditFrequency(habit.frequency);
};

// Save updated habit
const handleUpdateHabit = async (id) => {
    try {
        setError("");

        const response = await API.put(`/habits/${id}`, {
            title: editTitle,
            description: editDescription,
            frequency: editFrequency
        });

        setHabits((prevHabits) =>
            prevHabits.map((habit) =>
                habit._id === id ? response.data.data : habit
            )
        );

        setEditingId(null);

    } catch (error) {
        setError(
            error.response?.data?.message ||
            "Failed to update habit"
        );
    }
};

// Toggle habit completion
const handleToggleCheckIn = async (habitId, isCompleted) => {
    try {
        setError("");

        setCheckInLoading((prev) => ({
            ...prev,
            [habitId]: true
        }));

        if (isCompleted) {
            // Undo check-in
            await API.patch(`/habits/${habitId}/check-in`);

            setCompletedHabits((prev) =>
                prev.filter((id) => id !== habitId)
            );
        } else {
            // Mark habit as completed
            await API.post(`/habits/${habitId}`);

            setCompletedHabits((prev) => [
                ...prev,
                habitId
            ]);
        }

        // Refresh dashboard statistics
        await fetchDashboardSummary();
        await fetchWeeklyProgress();

    } catch (error) {
        setError(
            error.response?.data?.message ||
            "Failed to update habit completion"
        );
    } finally {
        setCheckInLoading((prev) => ({
            ...prev,
            [habitId]: false
        }));
    }
};

    if (loading) {
        return <h2>Loading habits...</h2>;
    }

    if (error) {
        return <h2>{error}</h2>;
    }

    return (
    <div className="app-layout">

        {/* Sidebar */}
        <aside className="sidebar">
            <h2 className="logo">HabitFlow</h2>

            <nav className="sidebar-nav">
                <a href="#dashboard" className="nav-link active">
                    Dashboard
                </a>

                <a href="#habits" className="nav-link">
                    My Habits
                </a>

                <a href="#progress" className="nav-link">
                    Progress
                </a>
            </nav>
        </aside>

        {/* Main Dashboard */}
        <main className="main-content" id="dashboard">

            <header className="dashboard-header">
                <div>
                    <h1>My Habit Tracker</h1>
                    <p>Build better habits, one day at a time.</p>
                </div>
            </header>
            
{dashboardSummary && (
    <section className="overview-section">
        <h2>Today's Overview</h2>

        <div className="stats-grid">
            <div className="stat-card green-card">
                <p>Total Habits</p>
                <h3>{dashboardSummary.totalHabits}</h3>
            </div>

            <div className="stat-card pink-card">
                <p>Completed Today</p>
                <h3>{dashboardSummary.completedHabits}</h3>
            </div>

            <div className="stat-card peach-card">
                <p>Pending</p>
                <h3>{dashboardSummary.pendingHabits}</h3>
            </div>

            <div className="stat-card purple-card">
                <p>Completion Rate</p>
                <h3>{dashboardSummary.completionPercentage}%</h3>
            </div>
        </div>
    </section>
)}

<section className="weekly-progress-section" id="progress">
    <div className="section-heading">
        <div>
            <h2>Weekly Progress</h2>
            <p>Track your consistency over the last seven days.</p>
        </div>
        <span className="habit-icon">✦</span>
    </div>

    <div className="chart-container">
        <ResponsiveContainer width="100%" height={300}>
            <BarChart
                data={weeklyProgress}
                margin={{ top: 15, right: 20, left: 0, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5eee7" />

                <XAxis
                    dataKey="date"
                    tickFormatter={(date) =>
                        new Date(date + "T00:00:00").toLocaleDateString(
                            "en-US",
                            { day: "numeric", month: "short" }
                        )
                    }
                />

                <YAxis allowDecimals={false} />

                <Tooltip />

                <Bar
                    dataKey="completedHabits"
                    name="Completed Habits"
                    fill="#438b65"
                    radius={[8, 8, 0, 0]}
                />
            </BarChart>
        </ResponsiveContainer>
    </div>
</section>

            
<section className="add-habit-section">
    <div className="section-heading">
        <div>
            <h2>Create a New Habit</h2>
            <p>Small steps today, big changes tomorrow.</p>
        </div>
        <span className="habit-icon">✦</span>
    </div>

    <form className="habit-form" onSubmit={handleAddHabit}>
        <div className="form-group">
            <label>Habit Title</label>
            <input
                type="text"
                placeholder="e.g. Practice DSA"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />
        </div>

        <div className="form-group">
            <label>Description</label>
            <textarea
                placeholder="What do you want to achieve?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            />
        </div>

        <div className="form-group">
            <label>Frequency</label>
            <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
            >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
            </select>
        </div>

        <button
            className="add-habit-button"
            type="submit"
            disabled={submitting}
        >
            {submitting ? "Adding..." : "+ Add Habit"}
        </button>
    </form>
</section>


 <section id="habits" className="my-habits-section">          
{habits.length === 0 ? (
    <p className="empty-habits">
        No habits found. Create your first habit!
    </p>
) : (
    <div className="habits-grid">
        
{habits.map((habit) => (
    <div className="habit-card" key={habit._id}>
        {editingId === habit._id ? (
            <div className="edit-habit-form">
                <h3>Edit Habit</h3>

                <input
                    type="text"
                    placeholder="Habit title"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                />

                <textarea
                    placeholder="Habit description"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                />

                <select
                    value={editFrequency}
                    onChange={(e) => setEditFrequency(e.target.value)}
                >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                </select>

                <div className="habit-actions">
                    <button
                        className="save-button"
                        onClick={() => handleUpdateHabit(habit._id)}
                    >
                        Save Changes
                    </button>

                    <button
                        className="cancel-button"
                        onClick={() => setEditingId(null)}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        ) : (
            <div className="habit-details">
                <div className="habit-card-heading">
                    <h3>{habit.title}</h3>
                    <span className="frequency-badge">
                        {habit.frequency}
                    </span>
                </div>

                <p className="habit-description">
                    {habit.description || "No description added."}
                </p>

                <label className="completion-label">
                    <input
                        type="checkbox"
                        checked={completedHabits.includes(habit._id)}
                        disabled={checkInLoading[habit._id]}
                        onChange={() =>
                            handleToggleCheckIn(
                                habit._id,
                                completedHabits.includes(habit._id)
                            )
                        }
                    />
                    {checkInLoading[habit._id]
                        ? "Updating..."
                        : "Completed today"}
                </label>

                <div className="habit-actions">
                    <button
                        className="edit-button"
                        onClick={() => handleEditClick(habit)}
                    >
                        Edit
                    </button>

                    <button
                        className="delete-button"
                        onClick={() => handleDeleteHabit(habit._id)}
                    >
                        Delete
                    </button>
                </div>
            </div>
        )}
    </div>
))}

    </div>
)}
</section>
        </main>
    </div>
    );
}

export default App;
