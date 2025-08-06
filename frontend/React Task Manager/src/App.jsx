import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
  IconButton,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Grid,
  Box
} from "@mui/material";
import { Delete, Edit, CalendarToday, PriorityHigh, Search } from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers";
import { format, parseISO } from "date-fns";

const API_URL = "http://localhost:8096/api/tasks";

export default function AdvancedTaskManager() {
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 10,
    total: 0
  });
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    due_date: null,
    priority: 3
  });
  const [filters, setFilters] = useState({
    completed: null,
    search: "",
    sort_by: "created_at",
    sort_dir: "desc"
  });
  const [editingTask, setEditingTask] = useState(null);
  const [selectedTasks, setSelectedTasks] = useState([]);

  // Fetch tasks with filters and pagination
  const fetchTasks = async (page = 1) => {
    try {
      const params = {
        ...filters,
        page,
        per_page: pagination.per_page
      };
      const res = await axios.get(API_URL, { params });
      setTasks(res.data.data);
      setPagination({
        current_page: res.data.current_page,
        per_page: res.data.per_page,
        total: res.data.total
      });
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  // Create new task
  const handleAddTask = async () => {
    if (!newTask.title.trim()) return;
    try {
      await axios.post(API_URL, {
        ...newTask,
        due_date: newTask.due_date ? newTask.due_date.toISOString() : null
      });
      setNewTask({
        title: "",
        description: "",
        due_date: null,
        priority: 3
      });
      fetchTasks();
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  // Update task
  const handleUpdateTask = async () => {
    if (!editingTask) return;
    try {
      await axios.put(`${API_URL}/${editingTask.id}`, {
        ...editingTask,
        due_date: editingTask.due_date ? editingTask.due_date.toISOString() : null
      });
      setEditingTask(null);
      fetchTasks(pagination.current_page);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  // Delete task
  const deleteTask = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchTasks(pagination.current_page);
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  // Bulk update tasks status
  const bulkUpdateStatus = async (completed) => {
    if (selectedTasks.length === 0) return;
    try {
      await axios.post(`${API_URL}/bulk-update`, {
        task_ids: selectedTasks,
        completed
      });
      setSelectedTasks([]);
      fetchTasks(pagination.current_page);
    } catch (error) {
      console.error("Error bulk updating tasks:", error);
    }
  };

  // Toggle task selection
  const toggleTaskSelection = (id) => {
    setSelectedTasks(prev =>
      prev.includes(id)
        ? prev.filter(taskId => taskId !== id)
        : [...prev, id]
    );
  };

  // Handle filter change
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    fetchTasks();
  }, [filters, pagination.per_page]);

  const priorityColors = {
    1: "error",
    2: "warning",
    3: "info",
    4: "primary",
    5: "success"
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Advanced Task Manager
        </Typography>

        {/* Task Filters */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.completed}
              label="Status"
              onChange={(e) => handleFilterChange("completed", e.target.value)}
            >
              <MenuItem value={null}>All</MenuItem>
              <MenuItem value={false}>Active</MenuItem>
              <MenuItem value={true}>Completed</MenuItem>
            </Select>
          </FormControl>

          <TextField
            size="small"
            label="Search"
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            InputProps={{
              startAdornment: <Search fontSize="small" sx={{ mr: 1 }} />
            }}
          />

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={filters.sort_by}
              label="Sort By"
              onChange={(e) => handleFilterChange("sort_by", e.target.value)}
            >
              <MenuItem value="created_at">Created Date</MenuItem>
              <MenuItem value="due_date">Due Date</MenuItem>
              <MenuItem value="priority">Priority</MenuItem>
              <MenuItem value="title">Title</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Order</InputLabel>
            <Select
              value={filters.sort_dir}
              label="Order"
              onChange={(e) => handleFilterChange("sort_dir", e.target.value)}
            >
              <MenuItem value="asc">Ascending</MenuItem>
              <MenuItem value="desc">Descending</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Task Creation/Editing Form */}
        <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="h6" gutterBottom>
            {editingTask ? "Edit Task" : "Add New Task"}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Title"
                value={editingTask ? editingTask.title : newTask.title}
                onChange={(e) =>
                  editingTask
                    ? setEditingTask({ ...editingTask, title: e.target.value })
                    : setNewTask({ ...newTask, title: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={editingTask ? editingTask.priority : newTask.priority}
                  label="Priority"
                  onChange={(e) =>
                    editingTask
                      ? setEditingTask({ ...editingTask, priority: e.target.value })
                      : setNewTask({ ...newTask, priority: e.target.value })
                  }
                >
                  <MenuItem value={1}>Urgent (1)</MenuItem>
                  <MenuItem value={2}>High (2)</MenuItem>
                  <MenuItem value={3}>Medium (3)</MenuItem>
                  <MenuItem value={4}>Low (4)</MenuItem>
                  <MenuItem value={5}>Very Low (5)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Description"
                value={editingTask ? editingTask.description : newTask.description}
                onChange={(e) =>
                  editingTask
                    ? setEditingTask({ ...editingTask, description: e.target.value })
                    : setNewTask({ ...newTask, description: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Due Date"
                value={editingTask ? editingTask.due_date : newTask.due_date}
                onChange={(date) =>
                  editingTask
                    ? setEditingTask({ ...editingTask, due_date: date })
                    : setNewTask({ ...newTask, due_date: date })
                }
                renderInput={(params) => <TextField fullWidth {...params} />}
              />
            </Grid>
            <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center' }}>
              {editingTask ? (
                <>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleUpdateTask}
                    sx={{ mr: 2 }}
                  >
                    Update Task
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => setEditingTask(null)}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAddTask}
                >
                  Add Task
                </Button>
              )}
            </Grid>
          </Grid>
        </Box>

        {/* Bulk Actions */}
        {selectedTasks.length > 0 && (
          <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
            <Typography variant="subtitle1" sx={{ mr: 2 }}>
              {selectedTasks.length} selected
            </Typography>
            <Button
              variant="outlined"
              color="success"
              onClick={() => bulkUpdateStatus(true)}
            >
              Mark as Complete
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={() => bulkUpdateStatus(false)}
            >
              Mark as Incomplete
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={() => {
                selectedTasks.forEach(id => deleteTask(id));
                setSelectedTasks([]);
              }}
            >
              Delete Selected
            </Button>
          </Box>
        )}

        {/* Tasks List */}
        <List>
          {tasks.map((task) => (
            <Paper key={task.id} elevation={1} sx={{ mb: 1 }}>
              <ListItem>
                <Checkbox
                  checked={task.completed}
                  onChange={() => {
                    axios.put(`${API_URL}/${task.id}`, {
                      completed: !task.completed
                    }).then(() => fetchTasks(pagination.current_page));
                  }}
                />
                <Checkbox
                  checked={selectedTasks.includes(task.id)}
                  onChange={() => toggleTaskSelection(task.id)}
                  sx={{ mr: 1 }}
                />
                <ListItemText
                  primary={
                    <Typography
                      variant="body1"
                      sx={{
                        textDecoration: task.completed ? "line-through" : "none",
                        color: task.completed ? "text.secondary" : "text.primary"
                      }}
                    >
                      {task.title}
                    </Typography>
                  }
                  secondary={
                    <>
                      {task.description && (
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                          {task.description}
                        </Typography>
                      )}
                      <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                        {task.due_date && (
                          <Chip
                            icon={<CalendarToday fontSize="small" />}
                            label={`Due: ${format(parseISO(task.due_date), 'MMM dd, yyyy')}`}
                            size="small"
                            color={new Date(task.due_date) < new Date() && !task.completed ? "error" : "default"}
                          />
                        )}
                        <Chip
                          icon={<PriorityHigh fontSize="small" />}
                          label={`Priority: ${task.priority}`}
                          size="small"
                          color={priorityColors[task.priority]}
                        />
                      </Box>
                    </>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => setEditingTask({
                      ...task,
                      due_date: task.due_date ? parseISO(task.due_date) : null
                    })}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    edge="end"
                    onClick={() => deleteTask(task.id)}
                  >
                    <Delete />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            </Paper>
          ))}
        </List>

        {/* Pagination */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Items per page</InputLabel>
            <Select
              value={pagination.per_page}
              label="Items per page"
              onChange={(e) => {
                setPagination(prev => ({
                  ...prev,
                  per_page: e.target.value
                }));
              }}
            >
              <MenuItem value={5}>5</MenuItem>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={20}>20</MenuItem>
              <MenuItem value={50}>50</MenuItem>
            </Select>
          </FormControl>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              disabled={pagination.current_page === 1}
              onClick={() => fetchTasks(pagination.current_page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outlined"
              disabled={
                pagination.current_page * pagination.per_page >= pagination.total
              }
              onClick={() => fetchTasks(pagination.current_page + 1)}
            >
              Next
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}