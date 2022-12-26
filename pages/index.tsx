import {useQuery} from "react-query";
import axios from "axios";

export default function Home() {

    const fetchTodos = () => {
        return axios.get('http://localhost:3000/api/hello');
    };

    const {isLoading, error, data, isFetching} = useQuery("users", fetchTodos);

    if (isLoading) {
        return <span>최초 데이터 서버에서 가져오는중</span>
    }

    if (error) {
        return <span>에러 발생</span>
    }

    if (isFetching)
        return <span>캐싱된 데이터 가져오는 중</span>

    return (
        <div>
            <span>데이터 가져왓씁니다</span>
            <span>{JSON.stringify(data)}</span>
        </div>
    )
}
