function selectFeaturedCourse(target) {
  const card = target?.closest?.(".featured-course-card[data-course-id]");
  if (!card) return;
  card.closest(".featured-course-track")?.querySelectorAll(".featured-course-card[data-course-id]").forEach((item) => {
    const isSelected = item === card;
    item.classList.toggle("is-selected", isSelected);
    item.setAttribute("aria-pressed", isSelected ? "true" : "false");
  });
}

document.addEventListener("click", (event) => selectFeaturedCourse(event.target), true);
document.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") selectFeaturedCourse(event.target);
}, true);
