import "./App.css";
import { useTaskManager } from "./hooks/useTaskManager";
import { ProgressBar } from "./components/ProgressBar";
import { StatsGrid } from "./components/StatsGrid";
import { AddTaskForm } from "./components/AddTaskForm";
import { FilterBar } from "./components/FilterBar";
import { TaskList } from "./components/TaskList";
import { DailySummary } from "./components/DailySummary";
import styles from "./App.module.css";

function App() {
  const {
    tasks,
    visible,
    filter,
    input,
    selectedPriority,
    selectedCategory,
    editId,
    editText,
    dragId,
    dragOverId,
    justCompleted,
    removing,
    justAdded,
    editRef,
    listRef,
    total,
    doneCount,
    remaining,
    pct,
    highPriorityCount,
    mediumPriorityCount,
    lowPriorityCount,
    setFilter,
    setInput,
    setSelectedPriority,
    setSelectedCategory,
    setEditId,
    setEditText,
    addTask,
    toggleTask,
    removeTask,
    startEdit,
    confirmEdit,
    onDragStart,
    onDragOver,
    onDrop,
    onDragEnd,
  } = useTaskManager();

  return (
    <div className={styles.app}>
      <div className={styles.header}>
        <h1 className={styles.title}>Task tracker</h1>
        <p className={styles.subtitle}>
          Drag to reorder · Double-click to edit · Stay productive
        </p>
      </div>

      {/* <ProgressBar percentage={pct} /> */}

      <DailySummary
        highPriorityCount={highPriorityCount}
        mediumPriorityCount={mediumPriorityCount}
        lowPriorityCount={lowPriorityCount}
        remaining={remaining}
      />

      <StatsGrid
        total={total}
        doneCount={doneCount}
        remaining={remaining}
        pct={pct}
      />

      <AddTaskForm
        input={input}
        setInput={setInput}
        addTask={addTask}
        selectedPriority={selectedPriority}
        setSelectedPriority={setSelectedPriority}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      <FilterBar activeFilter={filter} onFilterChange={setFilter} />

      <TaskList
        visible={visible}
        activeFilter={filter}
        listRef={listRef}
        editId={editId}
        editText={editText}
        editRef={editRef}
        onEditStart={startEdit}
        onEditConfirm={confirmEdit}
        onEditTextChange={setEditText}
        onEditCancel={() => { setEditId(null); setEditText(""); }}
        onToggle={toggleTask}
        onRemove={removeTask}
        dragId={dragId}
        dragOverId={dragOverId}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onDragEnd={onDragEnd}
        removing={removing}
        justAdded={justAdded}
        justCompleted={justCompleted}
      />

      {tasks.length > 0 && (
        <div className={styles.hint}>
          <span className={styles.hintKey}>Enter</span> to add
          <span className={styles.hintDivider}>·</span>
          <span className={styles.hintKey}>Double-click</span> to edit
          <span className={styles.hintDivider}>·</span>
          <span className={styles.hintKey}>Drag</span> to reorder
        </div>
      )}
    </div>
  );
}

export default App;
