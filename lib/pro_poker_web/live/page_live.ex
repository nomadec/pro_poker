defmodule ProPokerWeb.PageLive do
  use ProPokerWeb, :live_view
  alias Phoenix.PubSub

  @impl true
  def mount(_params, _session, socket) do
    PubSub.subscribe(ProPoker.PubSub, "in-game")
    {:ok, assign(socket, query: "", results: %{})}
  end

  @impl true
  def handle_event("new_event", %{"command" => "create_game"}, socket) do
    {:ok, game_id} = ProPoker.GameLobby.create()
    response = %{
      status: "ok",
      data: %{
        game_id: game_id
      }
    }
    {:reply, response, socket}
  end

  def handle_event("new_event", %{"command" => "join", "game_id" => game_id, "player" => player} = event, socket) do
    case ProPoker.GameLobby.join(String.to_integer(game_id), player) do
      :ok ->
        response = %{
          status: "ok",
          info: "joined"
        }
        PubSub.broadcast(ProPoker.PubSub, "in-game", event)
        {:reply, response, socket}
      :not_found ->
        response = %{
          status: "join failed",
          info: "lobby not found"
        }
        {:reply, response, socket}
    end
  end

  def handle_event("new_event", event, socket) do
    PubSub.broadcast(ProPoker.PubSub, "in-game", event)
    {:reply, %{status: "ok"}, socket}
    # {:noreply, socket}
  end

  def handle_event("new_event", event, socket) do
    IO.inspect(event)
    {:reply, %{status: "unknown message"}, socket}
    # {:noreply, socket}
  end

  @impl true
  def handle_info(event, socket) do
    {:noreply, push_event(socket, "game_event", %{event: event})}
  end

end
