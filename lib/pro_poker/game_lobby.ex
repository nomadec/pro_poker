defmodule ProPoker.GameLobby do

  def init do
    :ets.new(__MODULE__, [:set, :public, :named_table, read_concurrency: true, write_concurrency: true])
  end

  def terminate do
    :ets.delete(__MODULE__)
  end

  def create() do
    game_id = create_random_id(4)
    players = []
    lobby = {game_id, players}
    :ets.insert(__MODULE__, lobby)
    {:ok, game_id}
  end

  def join(game_id, player) do
    case :ets.lookup(__MODULE__, game_id) do
      [] ->
        :not_found;
      [{game_id, players} = _lobby] ->
        lobby = {game_id, players ++ [player]}
        :true = :ets.insert(__MODULE__, lobby)
        :ok
    end
  end

  defp create_random_id(len) do
    1..len
    |> Enum.map(fn _ -> Enum.random(0..9) end)
    |> Enum.join()
    |> String.to_integer()
  end

  def update(user_id, %{asset: asset, available: available, total: total, timestamp: timestamp}) do
    wallet_id = {user_id, asset}
    wallet = {wallet_id, available, total, timestamp}
    :ets.insert(__MODULE__, wallet)
  end
  def update(user_id, wallets) when is_list(wallets), do: Enum.map(wallets, fn w -> update(user_id, w) end)

  def get({_user_id, asset} = wallet_id) do
    case :ets.lookup(__MODULE__, wallet_id) do
      [] ->
        {:not_found, wallet_id}
      [{^wallet_id, available, total, timestamp}] ->
        %{
          asset: asset,
          available: available,
          total: total,
          timestamp: timestamp
        }
    end
  end

  def lock_amount(user_id, asset, amount) do
    wallet_id = {user_id, asset}
    case :ets.lookup(__MODULE__, wallet_id) do
      [] ->
        false
      [{^wallet_id, available, _total, _timestamp}] when available >= amount ->
        true
      [{^wallet_id, available, _total, _timestamp}] when available < amount ->
        false
    end
  end

end
