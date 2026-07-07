// 이 파일은 투두 우선순위(긴급/중요) 색상 담당
// 긴급+중요(크림슨) / 중요(파랑) / 긴급(앰버) / 둘 다 아님(회색)
export function priorityColor(todo) {
  if (todo.urgent && todo.important) return '#c9536e'
  if (todo.important) return '#4a9bc9'
  if (todo.urgent) return '#e3a93c'
  return '#aeb6bd'
}
