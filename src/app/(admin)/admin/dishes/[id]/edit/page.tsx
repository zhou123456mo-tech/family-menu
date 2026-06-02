import { DishForm } from '@/components/admin/dish-form'

export default function EditDishPage({ params }: { params: Promise<{ id: string }> }) {
  return params.then(({ id }) => <DishForm dishId={id} />)
}
